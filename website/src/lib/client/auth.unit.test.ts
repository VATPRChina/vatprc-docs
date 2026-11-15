import type { paths } from "../api";
import createClient from "openapi-fetch";
import { afterEach, beforeEach, expect, test, vi } from "vitest";

let storage: Map<string, string>;
let fetchMock: ReturnType<typeof vi.fn<(request: Request) => Promise<Response>>>;

beforeEach(() => {
  vi.resetModules();
  storage = new Map();
  vi.stubGlobal("window", {});
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => storage.set(key, value),
    removeItem: (key: string) => storage.delete(key),
  });
  vi.stubGlobal("navigator", {});
  vi.stubEnv("VITE_API_ENDPOINT", "https://api.example.com");
  fetchMock = vi.fn<(request: Request) => Promise<Response>>();
  vi.stubGlobal("fetch", fetchMock);
  setTokens("expired-access", "initial-refresh", -1);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

function setTokens(access: string, refresh: string, expiresIn: number) {
  storage.set(
    "access_token",
    JSON.stringify({ access_token: access, expires_at: new Date(Date.now() + expiresIn * 1000).toJSON() }),
  );
  storage.set("refresh_token", JSON.stringify(refresh));
}

function tokenResponse() {
  return Response.json({ access_token: "new-access", refresh_token: "new-refresh", expires_in: 3600 });
}

async function sessionClient() {
  const auth = await import("./auth");
  const client = createClient<paths>({ baseUrl: "https://api.example.com" });
  client.use(auth.authMiddleware);
  return { auth, client };
}

test("restores an expired access token from persistent refresh credentials", async () => {
  fetchMock.mockImplementation(async (request: Request) => {
    if (request.url.endsWith("/auth/token")) {
      expect(await request.text()).toBe("grant_type=refresh_token&refresh_token=initial-refresh");
      return tokenResponse();
    }
    expect(request.headers.get("Authorization")).toBe("Bearer new-access");
    return Response.json({});
  });
  const { client } = await sessionClient();

  await client.GET("/api/session");

  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(JSON.parse(storage.get("refresh_token")!)).toBe("new-refresh");
});

test("concurrent requests share a single refresh", async () => {
  let finish!: (response: Response) => void;
  fetchMock.mockReturnValue(new Promise<Response>((resolve) => (finish = resolve)));
  const { auth } = await sessionClient();

  const first = auth.refresh();
  const second = auth.refresh();
  expect(first).toBe(second);
  finish(tokenResponse());
  await Promise.all([first, second]);

  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test.each(["network", "server"])("%s errors release all waiters and allow a later retry", async (failure) => {
  if (failure === "network") fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
  else fetchMock.mockResolvedValueOnce(Response.json({ error: "server_error" }, { status: 500 }));
  fetchMock.mockResolvedValueOnce(tokenResponse());
  const { auth } = await sessionClient();
  const { getDefaultStore } = await import("jotai");

  const results = await Promise.allSettled([auth.refresh(), auth.refresh()]);

  expect(results.map((result) => result.status)).toEqual(["rejected", "rejected"]);
  expect(getDefaultStore().get(auth.isRefreshingAtom)).toBe(false);
  expect(JSON.parse(storage.get("refresh_token")!)).toBe("initial-refresh");
  await auth.refresh();
  expect(auth.getAccessToken()).toBe("new-access");
});

test("invalid refresh credentials clear the session and release refresh state", async () => {
  fetchMock.mockResolvedValueOnce(Response.json({ error: "invalid_grant" }, { status: 400 }));
  const { auth } = await sessionClient();
  const { getDefaultStore } = await import("jotai");

  await Promise.all([auth.refresh(), auth.refresh()]);

  expect(auth.getAccessToken()).toBeUndefined();
  expect(getDefaultStore().get(auth.isRefreshingAtom)).toBe(false);
  expect(JSON.parse(storage.get("refresh_token")!)).toBeNull();
  // A later login must still be able to refresh.
  setTokens("expired-again", "another-refresh", -1);
  fetchMock.mockResolvedValueOnce(tokenResponse());
  await auth.refresh();
  expect(auth.getAccessToken()).toBe("new-access");
});

test("reads tokens rotated by another tab even when atoms are not mounted", async () => {
  const { auth, client } = await sessionClient();
  expect(auth.getAccessToken()).toBe("expired-access");
  setTokens("other-tab-access", "other-tab-refresh", 3600);
  fetchMock.mockImplementation((request: Request) => {
    expect(request.headers.get("Authorization")).toBe("Bearer other-tab-access");
    return Promise.resolve(Response.json({}));
  });

  await client.GET("/api/session");

  expect(fetchMock).toHaveBeenCalledTimes(1);
});

test("rechecks stored credentials after acquiring the cross-tab refresh lock", async () => {
  const requestLock = vi.fn(async (_name: string, callback: () => Promise<void>) => {
    // Simulate the previous lock holder completing its rotation.
    setTokens("other-tab-access", "other-tab-refresh", 3600);
    await callback();
  });
  vi.stubGlobal("navigator", { locks: { request: requestLock } });
  const { auth } = await sessionClient();

  await auth.refresh();

  expect(requestLock).toHaveBeenCalledWith("vatprc-session-refresh", expect.any(Function));
  expect(fetchMock).not.toHaveBeenCalled();
  expect(auth.getAccessToken()).toBe("other-tab-access");
});

test("refreshes shortly before access expiry so requests do not send an expiring token", async () => {
  setTokens("nearly-expired", "initial-refresh", 10);
  fetchMock.mockResolvedValueOnce(tokenResponse()).mockResolvedValueOnce(Response.json({}));
  const { client } = await sessionClient();

  await client.GET("/api/session");

  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(fetchMock.mock.calls[1][0].headers.get("Authorization")).toBe("Bearer new-access");
});

test("independent tabs serialize refreshes and reuse the rotated token", async () => {
  let previous = Promise.resolve();
  const requestLock = vi.fn((_name: string, callback: () => Promise<void>) => {
    const next = previous.then(callback);
    previous = next;
    return next;
  });
  vi.stubGlobal("navigator", { locks: { request: requestLock } });
  const firstTab = await sessionClient();
  // Each browser tab has its own module state but shares localStorage and locks.
  vi.resetModules();
  const secondTab = await sessionClient();
  fetchMock.mockImplementation((request: Request) => {
    if (request.url.endsWith("/auth/token")) return Promise.resolve(tokenResponse());
    expect(request.headers.get("Authorization")).toBe("Bearer new-access");
    return Promise.resolve(Response.json({}));
  });

  await Promise.all([firstTab.client.GET("/api/session"), secondTab.client.GET("/api/session")]);

  expect(requestLock).toHaveBeenCalledTimes(2);
  expect(fetchMock.mock.calls.filter(([request]) => request.url.endsWith("/auth/token"))).toHaveLength(1);
  expect(firstTab.auth.getAccessToken()).toBe("new-access");
  expect(secondTab.auth.getAccessToken()).toBe("new-access");
});
