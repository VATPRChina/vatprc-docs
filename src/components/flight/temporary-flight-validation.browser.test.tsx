import { FlightDetails } from "./flight-details";
import { TemporaryFlightValidation } from "./temporary-flight-validation";
import type { components, operations } from "@/lib/api";
import { renderComponent } from "@/test/render-component";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ get: vi.fn(), permissions: vi.fn(), query: vi.fn() }));
vi.mock("@/lib/client", () => ({ usePermissions: mocks.permissions, $api: { useQuery: mocks.query } }));
vi.mock("@/lib/client/client", () => ({ client: { GET: mocks.get } }));
vi.mock("@/lib/utils", async () => ({ cn: (await import("clsx")).clsx }));

const validation: components["schemas"]["FlightValidationDto"] = {
  validators: [
    { id: "aircraft-type", field: { kind: "aircraft-type" }, status: "pass", problems: [] },
    { id: "preferred-route", field: { kind: "multiple-legs", from: 2, to: 4 }, status: "suppressed", problems: [] },
    {
      id: "route-unknown-leg-or-fix",
      field: { kind: "leg", index: 2 },
      status: "rejected",
      problems: [{ kind: "route-unknown-leg-or-fix", ident: "BADFIX" }],
    },
  ],
};
const route: components["schemas"]["FlightRouteDto"] = {
  segments: [
    {
      index: 1,
      kind: "hong_kong",
      initial_fix: "LEKEN",
      last_fix: "LELIM",
      enroute_initial_fix: "LEKEN",
      enroute_last_fix: "LELIM",
      legs: [
        { index: 3, from_ident: "SOUSA", to_ident: "LELIM", route_ident: "V611", leg_kind: "enroute" },
        { index: 2, from_ident: "LEKEN", to_ident: "SOUSA", route_ident: "V611", leg_kind: "enroute" },
      ],
    },
  ],
};
type Plan = operations["temporary_flight_validation"]["parameters"]["query"];
function apiResponse(path: string, options: { params: { query: Plan } }) {
  const data = path.endsWith("/validation")
    ? validation
    : path.endsWith("/route")
      ? route
      : {
          flight_plan: { ...options.params.query, callsign: "" },
        };
  return { data, response: { statusText: "OK" } };
}
beforeEach(() => {
  mocks.permissions.mockReturnValue(["software-engineer"]);
  mocks.get.mockReset();
  mocks.query.mockReset();
  mocks.get.mockImplementation(apiResponse);
});
function renderForm() {
  return renderComponent(
    <QueryClientProvider client={new QueryClient()}>
      <TemporaryFlightValidation />
    </QueryClientProvider>,
  );
}
async function fillRequired(screen: Awaited<ReturnType<typeof renderForm>>) {
  await screen.getByLabelText("Departure", { exact: false }).fill("zbaa");
  await screen.getByLabelText("Arrival", { exact: false }).fill("vhhh");
  await screen.getByLabelText("Aircraft Type", { exact: false }).fill("b738");
  await screen.getByLabelText("Cruising Level (feet)", { exact: false }).fill("32000");
  await screen.getByLabelText("Route", { exact: true }).fill(" leken v611 lelim ");
}

test("ordinary users and API clients cannot open or submit the form", async () => {
  for (const roles of [[], ["user"], ["api-client"]]) {
    mocks.permissions.mockReturnValue(roles);
    const screen = await renderForm();
    await expect.element(screen.getByText("Software engineer access required.")).toBeVisible();
    await expect.element(screen.getByRole("button", { name: "Run Validation" })).not.toBeInTheDocument();
    await screen.unmount();
  }
  expect(mocks.get).not.toHaveBeenCalled();
});

test("shows the normal plan fields, validation messages and route badges for the same submitted plan", async () => {
  const screen = await renderForm();
  expect(mocks.get).not.toHaveBeenCalled();
  await fillRequired(screen);
  await screen.getByLabelText("Equipment", { exact: true }).fill("rw");
  await screen.getByLabelText("Transponder", { exact: true }).fill("lb1");
  await screen.getByLabelText("PBN", { exact: true }).fill("d1");
  await screen.getByRole("button", { name: "Run Validation" }).click();
  await expect.element(screen.getByText("Last validated flight plan")).toBeVisible();
  const query = {
    departure: "ZBAA",
    arrival: "VHHH",
    aircraft: "B738",
    flight_rules: "I",
    wake_category: "M",
    equipment: "RW",
    navigation_performance: "D1",
    transponder: "LB1",
    raw_route: "LEKEN V611 LELIM",
    cruising_level: 32000,
  };
  for (const suffix of ["", "/validation", "/route"]) {
    expect(mocks.get).toHaveBeenCalledWith(`/api/flights/temporary/by-plan${suffix}`, { params: { query } });
  }
  expect(mocks.get).toHaveBeenCalledTimes(3);
  expect(mocks.query).not.toHaveBeenCalled();
  const results = screen.getByRole("region", { name: "Validation Result" });
  await expect.element(results.getByRole("heading", { name: "Flight Plan", exact: true })).toBeVisible();
  await expect.element(results.getByRole("heading", { name: "Resolved Route" })).toBeVisible();
  await expect.element(results.getByText("Hong Kong", { exact: true })).toBeVisible();
  await expect.element(results.getByText(/BADFIX/)).toBeVisible();
  await expect
    .element(results.getByText("Update the temporary flight plan above and run validation again."))
    .toBeVisible();
  expect(results.getByRole("link").all()).toHaveLength(0);
  const rows = results.getByRole("row");
  await expect.element(rows.nth(1).getByRole("cell").nth(0)).toHaveTextContent("3");
  await expect.element(rows.nth(1).getByRole("cell").nth(1)).toHaveTextContent("LEKEN");
  expect(rows.nth(1).getByRole("button").all()).toHaveLength(1);
  expect(rows.nth(2).getByRole("button").all()).toHaveLength(0);
  expect(
    results
      .getByRole("heading", { name: /Segment 2/ })
      .getByRole("button")
      .all(),
  ).toHaveLength(1);
  await screen.getByLabelText("Route", { exact: true }).fill("dct");
  expect(mocks.get).toHaveBeenCalledTimes(3);
  await expect.element(results.getByText("LEKEN V611 LELIM", { exact: true })).toBeVisible();
  await screen.getByRole("button", { name: "Run Validation" }).click();
  await expect.poll(() => mocks.get.mock.calls.length).toBe(6);
  await expect.element(results.getByText("DCT", { exact: true })).toBeVisible();
});

test("prevents incomplete plans and invalid airport codes from making requests", async () => {
  const screen = await renderForm();
  await screen.getByRole("button", { name: "Run Validation" }).click();
  expect(mocks.get).not.toHaveBeenCalled();
  await fillRequired(screen);
  await screen.getByLabelText("Departure", { exact: false }).fill("ZBA");
  await screen.getByRole("button", { name: "Run Validation" }).click();
  expect(mocks.get).not.toHaveBeenCalled();
});

test("shows API errors and allows retrying the same plan", async () => {
  mocks.get.mockImplementationOnce(() => ({
    error: { title: "Invalid plan", detail: "Cannot parse plan" },
    response: { statusText: "Bad Request" },
  }));
  const screen = await renderForm();
  await fillRequired(screen);
  await screen.getByRole("button", { name: "Run Validation" }).click();
  await expect.element(screen.getByText("Cannot parse plan")).toBeVisible();
  await screen.getByRole("button", { name: "Run Validation" }).click();
  await expect.element(screen.getByText("Last validated flight plan")).toBeVisible();
  await expect.element(screen.getByText("Cannot parse plan")).not.toBeInTheDocument();
  expect(mocks.get).toHaveBeenCalledTimes(6);
});

test("keeps validation results when the route request fails", async () => {
  mocks.get.mockImplementation((path: string, options: Parameters<typeof apiResponse>[1]) =>
    path.endsWith("/route")
      ? {
          error: { title: "Invalid route", detail: "Cannot resolve route" },
          response: { statusText: "Bad Request" },
        }
      : apiResponse(path, options),
  );
  const screen = await renderForm();
  await fillRequired(screen);
  await screen.getByRole("button", { name: "Run Validation" }).click();
  await expect.element(screen.getByText("Cannot resolve route")).toBeVisible();
  await expect.element(screen.getByText(/BADFIX/)).toBeVisible();
});

test("waits for the route response and keeps its submitted plan while the form is edited", async () => {
  let finish!: (value: unknown) => void;
  const pendingRoute = new Promise((resolve) => {
    finish = resolve;
  });
  mocks.get.mockImplementation((path: string, options: Parameters<typeof apiResponse>[1]) =>
    path.endsWith("/route") ? pendingRoute : apiResponse(path, options),
  );
  const screen = await renderForm();
  await fillRequired(screen);
  await screen.getByRole("button", { name: "Run Validation" }).click();
  await expect.element(screen.getByRole("button", { name: "Run Validation" })).toBeDisabled();
  await screen.getByLabelText("Route", { exact: true }).fill("DCT");
  finish({ data: route, response: { statusText: "OK" } });
  await expect.element(screen.getByText("LEKEN V611 LELIM", { exact: true })).toBeVisible();
  expect(mocks.get).toHaveBeenCalledTimes(3);
});

test("the shared live-flight result retains the VATSIM edit link", async () => {
  const plan: components["schemas"]["FlightPlanDto"] = {
    departure: "ZBAA",
    arrival: "VHHH",
    aircraft: "B738",
    callsign: "CCA123",
    flight_rules: "I",
    wake_category: "M",
    equipment: "RW",
    transponder: "LB1",
    navigation_performance: "D1",
    raw_route: "DCT",
    cruising_level: 32000,
  };
  const screen = await renderComponent(<FlightDetails plan={plan} validation={validation} />);
  await expect
    .element(screen.getByRole("link", { name: /edit your flight plan on VATSIM/ }))
    .toHaveAttribute("href", "https://my.vatsim.net/pilots/flightplan/");
  await expect.element(screen.getByText("CCA123", { exact: true })).toBeVisible();
});
