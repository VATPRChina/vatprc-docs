import { FlightParsedRoute, RouteResult } from "./flight-parsed-route";
import { renderComponent } from "@/test/render-component";
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
