import { FlightSearch } from "./flight-search";
import type { components } from "@/lib/api";
import { renderComponent } from "@/test/render-component";
import { beforeEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  query:
    vi.fn<
      (_method: string, path: string, params?: unknown, options?: { enabled?: boolean; retry?: boolean }) => unknown
    >(),
  permissions: vi.fn(),
}));
vi.mock("@/lib/client", () => ({ $api: { useQuery: mocks.query }, usePermissions: mocks.permissions }));
vi.mock("@/lib/utils", async () => ({ cn: (await import("clsx")).clsx }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, params, ...props }: { children: React.ReactNode; params: { callsign: string } }) => (
    <a {...props} href={`/flights/${params.callsign}`}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/ui/link-button", () => ({
  LinkButton: ({ children, params }: { children: React.ReactNode; params?: { callsign: string } }) => (
    <a href={params ? `/flights/${params.callsign}` : "/flights/route-viewer"}>{children}</a>
  ),
}));

const flight: components["schemas"]["FlightDto"] = {
  cid: "1234567",
  altitude: 30000,
  last_observed_at: "2026-10-25T00:00:00Z",
  flight_plan: {
    callsign: "CCA123",
    departure: "ZBAA",
    arrival: "ZSPD",
    aircraft: "B738",
    flight_rules: "I",
    wake_category: "M",
    equipment: "RW",
    transponder: "S",
    navigation_performance: "D1",
    cruising_level: 33100,
    raw_route: "DCT",
  },
};

beforeEach(() => {
  mocks.query.mockReset();
  mocks.permissions.mockReturnValue(["user"]);
  mocks.query.mockImplementation((_method: string, path: string, _params: unknown, options?: { enabled?: boolean }) => {
    if (path === "/api/flights/mine") return {};
    return options?.enabled ? { data: [flight] } : {};
  });
});

test("searches by complete airport codes and renders nested flight cards", async () => {
  const screen = await renderComponent(<FlightSearch />);
  expect(mocks.query.mock.calls.filter((call) => call[3]?.enabled)).toHaveLength(0);
  await screen.getByLabelText("Departure", { exact: true }).fill("zbaa");
  expect(mocks.query).toHaveBeenCalledWith(
    "get",
    "/api/flights/by-departure/{icao}",
    { params: { path: { icao: "ZBAA" } } },
    { enabled: true, retry: false },
  );
  await expect.element(screen.getByRole("link", { name: /CCA123/ })).toHaveAttribute("href", "/flights/CCA123");
  await expect.element(screen.getByText("B738", { exact: true })).toBeVisible();
  await screen.getByLabelText("Arrival", { exact: true }).fill("zsss");
  await expect.element(screen.getByText("No results.", { exact: true })).toBeVisible();
  await screen.getByLabelText("Departure", { exact: true }).fill("");
  expect(mocks.query).toHaveBeenCalledWith(
    "get",
    "/api/flights/by-arrival/{icao}",
    { params: { path: { icao: "ZSSS" } } },
    { enabled: true, retry: false },
  );
});

test("opens callsigns directly and never calls removed flight endpoints", async () => {
  const screen = await renderComponent(<FlightSearch />);
  await screen.getByLabelText("Callsign / CID").fill("cca456");
  await expect.element(screen.getByRole("link", { name: "Find flight" })).toHaveAttribute("href", "/flights/CCA456");
  expect(
    mocks.query.mock.calls.some((call) => call[1] === "/api/flights/active" || call[1].endsWith("/warnings")),
  ).toBe(false);
  await expect.element(screen.getByRole("link", { name: "Route Viewer" })).not.toBeInTheDocument();
});

test("keeps the signed-in pilot's offline state separate from lookup errors", async () => {
  mocks.query.mockImplementation((_method: string, path: string) =>
    path === "/api/flights/mine"
      ? { error: { status: 404, type: "urn:vatprc-uniapi-error:flight-not-found-for-cid", title: "Offline" } }
      : {},
  );
  const screen = await renderComponent(<FlightSearch />);
  await expect.element(screen.getByText("Your flight is not online", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("Offline", { exact: true })).not.toBeInTheDocument();
});
