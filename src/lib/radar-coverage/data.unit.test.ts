import { BUILTIN_REGIONS, loadRegion, parseRegion } from "./data";
import { afterEach, expect, test, vi } from "vitest";

const airspace = {
  code: "ZBPE",
  name: "Beijing",
  boundary: [
    [0, 0],
    [0, 1],
    [1, 0],
  ],
  airspace: { tma: [], twr: [] },
};
const stations = [{ name: "Site", type: "SSR_ModeC", lat: 0, lon: 0, elevation: -30, maxRange: 100 }];
afterEach(() => vi.unstubAllGlobals());
test("validates selected FIR JSON and normalizes surveillance types", () => {
  expect(parseRegion("ZBPE", airspace, stations).radars[0].type).toBe("SSR");
  expect(() => parseRegion("ZMUB", airspace, stations)).toThrow();
  expect(() => parseRegion("ZBPE", airspace, [{ ...stations[0], lat: null }])).toThrow();
  expect(() =>
    parseRegion(
      "ZBPE",
      {
        ...airspace,
        boundary: [
          [0, 0],
          [1, 1],
          [2, 2],
        ],
      },
      stations,
    ),
  ).toThrow();
  const codes = BUILTIN_REGIONS.map((r) => r.code);
  expect(new Set(codes).size).toBe(codes.length);
  expect(codes).toContain("ZMUB");
});
test("only fetches selected FIR files and shares cached requests", async () => {
  const fetcher = vi.fn((url: string) =>
    Promise.resolve(new Response(JSON.stringify(url.endsWith("airspace.json") ? airspace : stations))),
  );
  vi.stubGlobal("fetch", fetcher);
  const [first, second] = await Promise.all([loadRegion("ZBPE"), loadRegion("ZBPE")]);
  expect(first).toBe(second);
  expect(fetcher).toHaveBeenCalledTimes(2);
  expect(fetcher.mock.calls.every(([url]) => url.includes("/ZBPE/"))).toBe(true);
});
test("failed FIR requests can be retried", async () => {
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(new Response("", { status: 503 }))
    .mockResolvedValueOnce(new Response("[]"));
  vi.stubGlobal("fetch", fetcher);
  await expect(loadRegion("ZMUB")).rejects.toThrow();
  fetcher.mockImplementation((url: string) =>
    Promise.resolve(
      new Response(JSON.stringify(url.endsWith("airspace.json") ? { ...airspace, code: "ZMUB" } : stations)),
    ),
  );
  expect((await loadRegion("ZMUB")).code).toBe("ZMUB");
});
