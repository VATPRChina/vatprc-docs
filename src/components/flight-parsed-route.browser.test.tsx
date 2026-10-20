import { FlightParsedRoute, RouteResult } from "./flight-parsed-route";
import { renderComponent } from "@/test/render-component";
import { Map as MapLibreMap } from "maplibre-gl";
import { expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ permissions: vi.fn(), query: vi.fn() }));
vi.mock("@/lib/client", () => ({ usePermissions: mocks.permissions, $api: { useQuery: mocks.query } }));
// Start's server helpers require virtual entries unavailable in component tests.
vi.mock("@/lib/utils", async () => ({ cn: (await import("clsx")).clsx }));

const flight = { departure: "ZBAA", raw_route: " ELKUR W40 YQG ", arrival: "ZSPD" };
const legs = [
  {
    from: { identifier: "ZBAA", latitude: 40, longitude: 116, is_unknown: false },
    to: { identifier: "ZSPD", latitude: 31, longitude: 121, is_unknown: false },
    leg_identifier: "",
    is_unknown: false,
    is_sid: false,
    is_star: false,
    is_mainland: false,
  },
];

test("does not request or expose the route without the SWE role", async () => {
  mocks.permissions.mockReturnValue(["user"]);
  mocks.query.mockClear();
  const screen = await renderComponent(<FlightParsedRoute flight={flight} />);
  await expect.element(screen.getByRole("heading", { name: "Parsed route v2" })).not.toBeInTheDocument();
  expect(mocks.query).not.toHaveBeenCalled();
});

test("requests the complete current route and updates when the flight plan changes", async () => {
  mocks.permissions.mockReturnValue(["software-engineer"]);
  mocks.query.mockReturnValue({ isLoading: true, isFetching: true, refetch: vi.fn() });
  const screen = await renderComponent(<FlightParsedRoute flight={flight} />);
  expect(mocks.query).toHaveBeenLastCalledWith(
    "get",
    "/api/flights/route/v2",
    { params: { query: { route: "ZBAA ELKUR W40 YQG ZSPD" } } },
    { enabled: true, retry: false },
  );
  await screen.rerender(<FlightParsedRoute flight={{ ...flight, raw_route: "DCT", arrival: "ZSSS" }} />);
  expect(mocks.query).toHaveBeenLastCalledWith(
    "get",
    "/api/flights/route/v2",
    { params: { query: { route: "ZBAA DCT ZSSS" } } },
    { enabled: true, retry: false },
  );
  await screen.rerender(<FlightParsedRoute flight={{ ...flight, raw_route: "" }} />);
  expect(mocks.query).toHaveBeenLastCalledWith(
    "get",
    "/api/flights/route/v2",
    { params: { query: { route: "ZBAA ZSPD" } } },
    { enabled: true, retry: false },
  );
  mocks.query.mockReturnValue({ data: { legs: [], sid_candidates: [], domestic_segments: [] }, refetch: vi.fn() });
  await screen.rerender(<FlightParsedRoute flight={flight} />);
  await expect.element(screen.getByText("The parser returned no route segments.")).toBeVisible();
  await expect.element(screen.getByText("No SID candidates match this route.")).toBeVisible();
});

test("shows parser errors and keeps missing routes from triggering a request", async () => {
  mocks.permissions.mockReturnValue(["software-engineer"]);
  mocks.query.mockReturnValue({ error: { title: "Invalid route", detail: "Missing arrival" }, refetch: vi.fn() });
  const screen = await renderComponent(<FlightParsedRoute flight={flight} />);
  await expect.element(screen.getByText("Missing arrival")).toBeVisible();
  await screen.rerender(<FlightParsedRoute flight={{ ...flight, departure: "" }} />);
  expect(mocks.query.mock.calls.at(-1)?.[3]).toEqual({ enabled: false, retry: false });
});

test("renders route segments and a real map, then reports unresolved coordinates", async () => {
  const screen = await renderComponent(<RouteResult legs={legs} style={{ version: 8, sources: {}, layers: [] }} />);
  await expect.element(screen.getByText("ZBAA", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("DCT", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("ZSPD", { exact: true })).toBeVisible();
  await expect.element(screen.getByLabelText("Parsed route map")).toBeVisible();
  await expect.poll(() => document.querySelector(".maplibregl-canvas")?.clientWidth ?? 0).toBeGreaterThan(0);
  await screen.rerender(
    <RouteResult
      legs={[{ ...legs[0], to: { identifier: "UNKNOWN", latitude: null, longitude: null, is_unknown: true } }]}
      style={{ version: 8, sources: {}, layers: [] }}
    />,
  );
  await expect.element(screen.getByText("UNKNOWN", { exact: true })).toHaveClass("text-red-600");
});

test("flags an unknown connection in red even with known endpoints", async () => {
  const screen = await renderComponent(
    <RouteResult
      legs={[{ ...legs[0], leg_identifier: "NOLEG", is_unknown: true }]}
      style={{ version: 8, sources: {}, layers: [] }}
    />,
  );
  await expect.element(screen.getByText("NOLEG", { exact: true })).toHaveClass("text-red-600");
  await expect.element(screen.getByText("ZBAA", { exact: true })).not.toHaveClass("text-red-600");
  await expect.element(screen.getByText("ZSPD", { exact: true })).not.toHaveClass("text-red-600");
});

test("draws mainland and crossing legs solid and outside legs dashed with a visible legend", async () => {
  const addLayer = vi.spyOn(MapLibreMap.prototype, "addLayer");
  try {
    const screen = await renderComponent(
      <RouteResult
        legs={[
          { ...legs[0], leg_identifier: "MAINLAND", is_mainland: true },
          { ...legs[0], leg_identifier: "FOREIGN", is_mainland: false },
        ]}
        style={{ version: 8, sources: {}, layers: [] }}
      />,
    );
    await expect.element(screen.getByText("China mainland: either endpoint inside", { exact: true })).toBeVisible();
    await expect.element(screen.getByText("Outside China mainland", { exact: true })).toBeVisible();
    await expect
      .element(screen.getByText("MAINLAND", { exact: true }))
      .toHaveAttribute("title", "China mainland: either endpoint inside");
    await expect
      .element(screen.getByText("FOREIGN", { exact: true }))
      .toHaveAttribute("title", "Outside China mainland");
    const layer = (id: string) => addLayer.mock.calls.map(([spec]) => spec).find((spec) => spec.id === id);
    await expect.poll(() => layer("flight-route-lines-outside")).toBeDefined();
    expect(layer("flight-route-lines-outside")).toMatchObject({
      filter: ["==", ["get", "is_mainland"], false],
      paint: { "line-dasharray": [2, 2] },
    });
    expect(layer("flight-route-lines")).toMatchObject({ filter: ["==", ["get", "is_mainland"], true] });
    const mainland = layer("flight-route-lines");
    expect(mainland?.type === "line" && mainland.paint).not.toHaveProperty("line-dasharray");
  } finally {
    addLayer.mockRestore();
  }
});

test("switches the map and route text between full route and each named domestic portion", async () => {
  const fitBounds = vi.spyOn(MapLibreMap.prototype, "fitBounds");
  try {
    const fix = (identifier: string, latitude: number, longitude: number) => ({
      identifier,
      latitude,
      longitude,
      is_unknown: false,
    });
    const points = [
      fix("ZSPD", 31, 121),
      fix("LAMEN", 32, 123),
      fix("FOREIGN", 35, 140),
      fix("ENTRY", 40, 130),
      fix("ZBAA", 40, 116),
    ];
    const routeLegs = points.slice(1).map((to, index) => ({
      ...legs[0],
      from: points[index],
      to,
      leg_identifier: `A${index}`,
      is_mainland: index === 0 || index === 3,
    }));
    const segments = [
      { identifier: "ZSPD-LAMEN", start_index: 0, end_index: 1 },
      { identifier: "ENTRY-ZBAA", start_index: 3, end_index: 4 },
    ];
    const style = { version: 8 as const, sources: {}, layers: [] };
    const screen = await renderComponent(<RouteResult legs={routeLegs} segments={segments} style={style} />);
    const full = screen.getByRole("radio", { name: "Full route", exact: true });
    await expect.element(full).toBeChecked();
    await expect.element(screen.getByText("FOREIGN", { exact: true })).toBeVisible();
    await expect.poll(() => fitBounds.mock.lastCall?.[0]).toEqual([116, 31, 140, 40]);

    await screen.getByText("ZSPD-LAMEN", { exact: true }).click();
    await expect.element(screen.getByRole("radio", { name: "ZSPD-LAMEN", exact: true })).toBeChecked();
    await expect.element(screen.getByText("FOREIGN", { exact: true })).not.toBeInTheDocument();
    await expect.element(screen.getByText("ZSPD", { exact: true })).toBeVisible();
    await expect.element(screen.getByText("LAMEN", { exact: true })).toBeVisible();
    await expect.poll(() => fitBounds.mock.lastCall?.[0]).toEqual([121, 31, 123, 32]);

    await screen.getByText("ENTRY-ZBAA", { exact: true }).click();
    await expect.element(screen.getByText("LAMEN", { exact: true })).not.toBeInTheDocument();
    await expect.element(screen.getByText("ENTRY", { exact: true })).toBeVisible();
    await expect.element(screen.getByText("ZBAA", { exact: true })).toBeVisible();
    await expect.poll(() => fitBounds.mock.lastCall?.[0]).toEqual([116, 40, 130, 40]);

    await screen.getByText("Full route", { exact: true }).click();
    await expect.element(screen.getByText("FOREIGN", { exact: true })).toBeVisible();
    await expect.poll(() => fitBounds.mock.lastCall?.[0]).toEqual([116, 31, 140, 40]);
    await screen.getByText("ENTRY-ZBAA", { exact: true }).click();
    // A refreshed response without the selected portion falls back to Full route.
    await screen.rerender(<RouteResult legs={routeLegs} segments={[]} style={style} />);
    await expect.element(full).toBeChecked();
    await expect.element(screen.getByText("FOREIGN", { exact: true })).toBeVisible();
  } finally {
    fitBounds.mockRestore();
  }
});

test("displays segment metadata returned by the route endpoint", async () => {
  mocks.permissions.mockReturnValue(["software-engineer"]);
  mocks.query.mockReturnValue({
    data: {
      legs,
      sid_candidates: [],
      segments: [
        {
          identifier: "ZBAA-ZSPD",
          kind: "mainland",
          start_index: 0,
          end_index: 1,
          route_start_airport: legs[0].from,
          route_end_airport: legs[0].to,
          enroute_start_fix: legs[0].from,
          enroute_end_fix: legs[0].to,
        },
      ],
    },
  });
  const screen = await renderComponent(<FlightParsedRoute flight={flight} />);
  await expect.element(screen.getByRole("region", { name: "Route segments" })).toBeVisible();
  await expect.element(screen.getByText("1. ZBAA-ZSPD", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("ZBAA-ZSPD", { exact: true })).toBeVisible();
  await screen.getByText("ZBAA-ZSPD", { exact: true }).click();
  await expect.element(screen.getByRole("radio", { name: "ZBAA-ZSPD", exact: true })).toBeChecked();
});
