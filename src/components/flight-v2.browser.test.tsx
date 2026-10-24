import { FlightV2, FlightV2Result } from "./flight-v2";
import type { components } from "@/lib/api";
import { renderComponent } from "@/test/render-component";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";

const mocks = vi.hoisted(() => ({ permissions: vi.fn(), query: vi.fn() }));
vi.mock("@/lib/client", () => ({ usePermissions: mocks.permissions, $api: { useQuery: mocks.query } }));
vi.mock("@/lib/utils", async () => ({ cn: (await import("clsx")).clsx }));
vi.mock("@/components/back-button", () => ({ BackButton: () => <button>Back</button> }));
vi.mock("@/components/flight-parsed-route", () => ({
  RouteResult: ({
    legs,
    legAnnotations,
  }: {
    legs: components["schemas"]["FlightV2Leg"][];
    legAnnotations?: (index: number) => React.ReactNode;
  }) => (
    <div aria-label="Parsed route">
      {legs.map((leg, index) => (
        <span key={index}>
          {leg.leg_identifier || "DCT"}
          {legAnnotations?.(index)}
        </span>
      ))}
    </div>
  ),
}));

const from = { identifier: "ZAAA", latitude: 30, longitude: 105, is_unknown: false };
const waypoint = { ...from, identifier: "WAY1", longitude: 110 };
const to = { ...from, identifier: "ZBBB", longitude: 115 };
const legs: components["schemas"]["FlightV2Leg"][] = [
  {
    from,
    to: waypoint,
    leg_identifier: "",
    is_mainland: true,
    is_sid: false,
    is_star: false,
    is_unknown: false,
    kind: "direct",
    direction_restriction: "none",
  },
  {
    from: waypoint,
    to,
    leg_identifier: "A1",
    is_mainland: true,
    is_sid: false,
    is_star: false,
    is_unknown: false,
    kind: "airway",
    direction_restriction: "forward",
  },
];
const candidate = { kind: "waypoint", identifier: "WAY1", is_unknown: false, fix: waypoint };
const ident = { identifier: "WAY1", amendments: [{ kind: "speed-and-altitude", value: "M082F331" }], errors: [] };
const route = {
  name: "Mainland preferred route",
  departure: "ZAAA",
  arrival: "ZBBB",
  raw_route: "WAY1",
  is_public: true,
  cruising_level_restriction: "standard-odd",
  allowed_altitudes: [33100],
  minimal_altitude: 30000,
  remarks: "Published route",
};
const match = {
  route,
  matched: true,
  start_leg_index: 0,
  end_leg_index: 2,
  from,
  to,
  enroute_start_fix: waypoint,
  enroute_end_fix: waypoint,
  airport_pair: true,
};
const data: components["schemas"]["FlightV2Dto"] = {
  flight_plan: {
    id: "flight",
    cid: "1234567",
    callsign: "CCA123",
    last_observed_at: "2026-10-24T00:00:00Z",
    departure: "ZAAA",
    arrival: "ZBBB",
    raw_route: "WAY1 A1",
    aircraft: "B738",
    flight_rules: "I",
    wake_category: "M",
    equipment: "RW",
    navigation_performance: "D1",
    transponder: "S",
    cruising_level: 33100,
    altitude: 30000,
  },
  route_parse: {
    lexer: [{ text: "WAY1", kind: "identifier", amendments: ident.amendments }],
    lex_grouper: [ident],
    resolver: [{ ident, candidates: [candidate] }],
    solver: [
      {
        ident: { identifier: "ZAAA", amendments: [], errors: [] },
        candidates: [
          {
            candidate: { kind: "airport", identifier: "ZAAA", is_unknown: false, fix: from },
            predecessor_index: null,
            distance_nm: 0,
            fallback_count: 0,
          },
        ],
      },
      {
        ident,
        candidates: [
          { candidate, predecessor_index: 0, distance_nm: 120.5, fallback_count: 0, latitude: 30, longitude: 110 },
        ],
      },
    ],
    constructor: legs.map((leg) => ({ leg })),
    expander: legs,
  },
  segments: [
    {
      kind: "mainland",
      identifier: "ZAAA-ZBBB",
      start_index: 0,
      end_index: 2,
      route_start_airport: from,
      route_end_airport: to,
      enroute_start_fix: waypoint,
      enroute_end_fix: waypoint,
      cross_border_enter_start_fix: from,
      cross_border_enter_end_fix: waypoint,
      legs,
    },
    {
      kind: "international",
      identifier: "WAY1-ZBBB",
      start_index: 2,
      end_index: 3,
      enroute_start_fix: waypoint,
      enroute_end_fix: to,
      legs: [{ ...legs[1], leg_identifier: "B2" }],
    },
  ],
  preferred_route_matching: [
    {
      segment_index: 0,
      selected_candidate_index: 1,
      candidates: [{ ...match, matched: false, route: { ...route, name: "Other route", raw_route: "OTHER" } }, match],
    },
    { segment_index: 1, candidates: [] },
  ],
  validations: [
    {
      validator_ident: "aircraft-type",
      field: "aircraft-type",
      scope: { level: "flight" },
      status: "pass",
      warnings: [],
    },
    {
      validator_ident: "route-preferred",
      field: "route",
      scope: { level: "segment", segment_index: 0, start_leg_index: 0, end_leg_index: 2 },
      status: "pass",
      warnings: [],
    },
    {
      validator_ident: "route-preferred",
      field: "route",
      scope: { level: "segment", segment_index: 1, start_leg_index: 2, end_leg_index: 3 },
      status: "rejected",
      warnings: [{ message_code: "not-preferred-route", field: "route", parameter: "OTHER" }],
    },
    {
      validator_ident: "route-direct-leg",
      field: "route",
      scope: { level: "leg", segment_index: 0, leg_index: 0 },
      status: "suppressed",
      warnings: [],
    },
  ],
  errors: [],
};

test("does not fetch or render v2 diagnostics for non-engineers", async () => {
  mocks.permissions.mockReturnValue(["user"]);
  mocks.query.mockClear();
  const screen = await renderComponent(<FlightV2 callsign="CCA123" />);
  expect(mocks.query).not.toHaveBeenCalled();
  await expect.element(screen.getByRole("region", { name: "Flight analysis v2" })).not.toBeInTheDocument();
});

test("uses the unified endpoint, refreshes it, and follows the selected callsign", async () => {
  mocks.permissions.mockReturnValue(["software-engineer"]);
  const refetch = vi.fn();
  mocks.query.mockReturnValue({ data, refetch });
  const screen = await renderComponent(<FlightV2 callsign="CCA123" />);
  expect(mocks.query).toHaveBeenLastCalledWith(
    "get",
    "/api/flights/by-callsign/{callsign}/v2",
    { params: { path: { callsign: "CCA123" } } },
    { retry: false },
  );
  await expect.element(screen.getByText("B738", { exact: true })).toBeVisible();
  await screen.getByRole("button", { name: "Refresh analysis" }).click();
  expect(refetch).toHaveBeenCalledOnce();
  await screen.rerender(<FlightV2 callsign="CCA456" />);
  expect(mocks.query).toHaveBeenLastCalledWith(
    "get",
    "/api/flights/by-callsign/{callsign}/v2",
    { params: { path: { callsign: "CCA456" } } },
    { retry: false },
  );
});

test("shows the overview then segments, with validators inline at their scopes", async () => {
  const screen = await renderComponent(<FlightV2Result data={data} />);
  await expect.element(screen.getByRole("heading", { name: "Flight Plan", exact: true })).toBeVisible();
  const first = screen.getByRole("article", { name: "Segment 1", exact: true });
  const second = screen.getByRole("article", { name: "Segment 2", exact: true });
  await expect.element(first).toBeVisible();
  await expect.element(second).toBeVisible();
  await expect.element(first.getByText("Selected match", { exact: true })).toBeVisible();
  await expect.element(first.getByText("No match", { exact: true })).toBeVisible();
  await expect.element(second.getByText("No preferred route candidates for this segment.")).toBeVisible();
  await expect.element(first.getByRole("button", { name: "designated route · Segment 1 (legs 1–2): P" })).toBeVisible();
  const rejected = second.getByRole("button", { name: "designated route · Segment 2 (legs 3–3): R" });
  await expect.element(rejected).toBeVisible();
  const flightField = document.querySelector('[data-field="aircraft-type"]');
  expect(flightField?.textContent).toContain("B738");
  expect(flightField?.querySelector("button")?.getAttribute("aria-label")).toBe(
    "ICAO aircraft type existence · Flight: P",
  );
  await expect
    .element(
      first
        .getByLabelText("Leg 1 validations")
        .getByRole("button", { name: "no direct route legs · Leg 1 (segment 1): S" }),
    )
    .toBeVisible();
  expect(document.querySelectorAll('[aria-label="Leg 3 validations"] button').length).toBe(0);
  const overview = document.querySelector('[aria-label="Flight Plan"]');
  const segment = document.querySelector('article[aria-label="Segment 1"]');
  expect(
    Boolean(overview && segment && overview.compareDocumentPosition(segment) & Node.DOCUMENT_POSITION_FOLLOWING),
  ).toBe(true);
  const parsed = segment?.querySelector('[aria-label="Parsed route"]');
  const matches = segment?.querySelector('[aria-label="Preferred routes"]');
  expect(Boolean(parsed && matches && parsed.compareDocumentPosition(matches) & Node.DOCUMENT_POSITION_FOLLOWING)).toBe(
    true,
  );
  await expect.element(screen.getByRole("tab")).not.toBeInTheDocument();
  await expect.element(screen.getByText("120.5 NM", { exact: true })).not.toBeInTheDocument();
  window.scrollTo(0, 0);
  await page.screenshot({ path: "../../.vitest/flight-v2-inline.png" });
  await rejected.click();
  await expect
    .element(screen.getByText("The flight plan does not match the designated route for this flight.", { exact: true }))
    .toBeVisible();
  await rejected.click();
});

test("keeps the overview and flight validators available when parsing fails", async () => {
  const partial = {
    ...data,
    segments: null,
    preferred_route_matching: null,
    validations: data.validations.slice(0, 1),
    errors: [{ stage: "resolver", message: "Navigation data unavailable" }],
  };
  const screen = await renderComponent(<FlightV2Result data={partial} />);
  await expect.element(screen.getByText("B738", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("Navigation data unavailable", { exact: true })).toBeVisible();
  await expect
    .element(screen.getByText("Route segments are unavailable. See the diagnostic error above."))
    .toBeVisible();
  await expect.element(screen.getByRole("button", { name: "ICAO aircraft type existence · Flight: P" })).toBeVisible();
  await expect.element(screen.getByRole("tab")).not.toBeInTheDocument();
});

test("reports loading and request failures", async () => {
  mocks.permissions.mockReturnValue(["software-engineer"]);
  mocks.query.mockReturnValue({ isLoading: true, refetch: vi.fn() });
  const screen = await renderComponent(<FlightV2 callsign="CCA123" />);
  await expect.element(screen.getByLabelText("Loading flight analysis")).toBeVisible();
  mocks.query.mockReturnValue({ error: { title: "Flight not found", detail: "No active flight" }, refetch: vi.fn() });
  await screen.rerender(<FlightV2 callsign="MISSING" />);
  await expect.element(screen.getByText("No active flight", { exact: true })).toBeVisible();
});
