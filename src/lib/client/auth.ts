import { components, paths } from "../api";
import { atom, getDefaultStore } from "jotai";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { SyncStringStorage } from "jotai/vanilla/utils/atomWithStorage";
import createClient, { type Middleware } from "openapi-fetch";

const authClient = createClient<paths>({ baseUrl: import.meta.env.VITE_API_ENDPOINT });

interface IAccessToken {
  access_token: string;
  expires_at: string;
}

let refreshPromise: Promise<void> | undefined;
const TOKEN_EXPIRY_MARGIN_MS = 30_000;

const noopStorage: SyncStringStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const sessionStore = getDefaultStore();
const getStorage = () => (typeof window !== "undefined" ? localStorage : noopStorage);
const accessTokenStorage = createJSONStorage<IAccessToken | null>(getStorage);
const refreshTokenStorage = createJSONStorage<string | null>(getStorage);
export const accessTokenAtom = atomWithStorage<IAccessToken | null>("access_token", null, accessTokenStorage, {
  getOnInit: true,
});
export const refreshTokenAtom = atomWithStorage<string | null>("refresh_token", null, refreshTokenStorage, {
  getOnInit: true,
});
export const isRefreshingAtom = atom(false);
export const hasAuthenticatedAtom = atom(
  (get) => !!get(accessTokenAtom) && Date.parse(get(accessTokenAtom)?.expires_at ?? "0") >= Date.now(),
);

// These atoms are read imperatively, so Jotai does not mount their storage
// subscriptions. Read storage again to pick up token rotation in other tabs.
const readAccessToken = (): IAccessToken | null =>
  typeof window === "undefined" ? sessionStore.get(accessTokenAtom) : accessTokenStorage.getItem("access_token", null);

const readRefreshToken = (): string | null =>
  typeof window === "undefined"
    ? sessionStore.get(refreshTokenAtom)
    : refreshTokenStorage.getItem("refresh_token", null);

export const getAccessToken = () => readAccessToken()?.access_token;

const hasFreshAccessToken = () => {
  const token = readAccessToken();
  return !!token && Date.parse(token.expires_at) > Date.now() + TOKEN_EXPIRY_MARGIN_MS;
};

export const redirectToLogin = () => {
  const url = new URL("/auth/authorize", import.meta.env.VITE_API_AUTH_ENDPOINT);
  url.searchParams.set("client_id", import.meta.env.VITE_API_CLIENT_ID);
  url.searchParams.set("redirect_uri", import.meta.env.VITE_API_REDIRECT_URI);
  url.searchParams.set("response_type", "code");

  localStorage.setItem("pre_oauth_path", window.location.pathname);
  location.assign(url.toString());
};

const handleSessionLoginResponse = (
  result: Pick<components["schemas"]["TokenResponse"], "access_token" | "expires_in" | "refresh_token">,
) => {
  const expires_at = new Date(Date.now() + result.expires_in * 1000).toJSON();
  if (result.refresh_token) {
    sessionStore.set(refreshTokenAtom, result.refresh_token);
  }
  sessionStore.set(accessTokenAtom, { access_token: result.access_token, expires_at });
};

export const login = async (code: string) => {
  const data = await authClient.POST("/auth/token", {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: {
      grant_type: "authorization_code",
      code,
      redirect_uri: import.meta.env.VITE_API_REDIRECT_URI,
      client_id: import.meta.env.VITE_API_CLIENT_ID,
    },
    bodySerializer(body) {
      return new URLSearchParams(body).toString();
    },
  });
  if (data.error) {
    throw new Error(`Error response from server: ${data.response.status} ${data.error?.error}`);
  }
  handleSessionLoginResponse(data.data);
};
const refreshStoredSession = async () => {
  // Another tab may have refreshed while this tab was waiting for the lock.
  if (hasFreshAccessToken() || !readRefreshToken()) return;
  const result = await authClient.POST("/auth/token", {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: {
      grant_type: "refresh_token",
      refresh_token: readRefreshToken() ?? "",
    },
    bodySerializer(body) {
      return new URLSearchParams(body).toString();
    },
  });
  if (result.error?.error === "invalid_grant") {
    forceLogout();
    return;
  } else if (!result.data) {
    throw new Error(`Error response from server: ${result.error.error_description} (${result.error.error})`);
  }
  handleSessionLoginResponse(result.data);
};

export const refresh = (): Promise<void> => {
  if (refreshPromise) return refreshPromise;
  sessionStore.set(isRefreshingAtom, true);
  refreshPromise = (async () => {
    try {
      // Refresh tokens are single-use. Serialize rotation across same-origin tabs.
      if (typeof navigator !== "undefined" && navigator.locks) {
        await navigator.locks.request("vatprc-session-refresh", refreshStoredSession);
      } else {
        await refreshStoredSession();
      }
    } finally {
      sessionStore.set(isRefreshingAtom, false);
      refreshPromise = undefined;
    }
  })();
  return refreshPromise;
};
export const logout = async () => {
  try {
    await authClient.DELETE("/api/session", { headers: { Authorization: `Bearer ${getAccessToken()}` } });
  } catch (e) {
    console.error("lougout failed = ", e);
  }
  forceLogout();
};
export const forceLogout = () => {
  sessionStore.set(accessTokenAtom, null);
  sessionStore.set(refreshTokenAtom, null);
};

/**
 * api security handler
 *
 * 1. check if access token exists and not expired
 * 2. if not, refresh access token
 *     1. check if refresh token exists
 *     2. if not, force logout
 * @returns request parameters with authentication
 */
export const authMiddleware: Middleware = {
  async onRequest({ request }) {
    const refreshToken = readRefreshToken();
    if (!hasFreshAccessToken()) {
      if (refreshToken) await refresh();
    }
    const accessToken = readAccessToken();
    if (accessToken) {
      request.headers.set("Authorization", `Bearer ${getAccessToken()}`);
    }
    return request;
  },
};
