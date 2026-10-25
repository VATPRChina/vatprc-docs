import { FlightRoute } from "./flight-route";
import { FlightValidationContext } from "./validation";
import { RequireRole } from "@/components/require-role";
import type { components } from "@/lib/api";
import { renderComponent } from "@/test/render-component";
import { beforeEach, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({ query: vi.fn(), permissions: vi.fn() }));
vi.mock("@/lib/client", () => ({ $api: { useQuery: mocks.query }, usePermissions: mocks.permissions }));

const validation: components["schemas"]["FlightValidationDto"] = {
  validators: [
    { id: "route-direct-leg", field: { kind: "leg", index: 2 }, status: "rejected", problems: [] },
    { id: "route-direct-leg", field: { kind: "leg", index: 3 }, status: "pass", problems: [] },
    { id: "preferred-route", field: { kind: "multiple-legs", from: 2, to: 4 }, status: "rejected", problems: [] },
  ],
};

beforeEach(() => {
  mocks.query.mockReset();
  mocks.permissions.mockReturnValue(["software-engineer"]);
  mocks.query.mockReturnValue({
    data: {
      segments: [
        {
          index: 1,
          initial_fix: "ALPHA",
          last_fix: "CHARLIE",
          enroute_initial_fix: "ALPHA",
          enroute_last_fix: "CHARLIE",
          legs: [
            { index: 3, from_ident: "BRAVO", to_ident: "CHARLIE", route_ident: "A1", leg_kind: "enroute" },
            { index: 2, from_ident: "ALPHA", to_ident: "BRAVO", route_ident: null, leg_kind: "enroute" },
          ],
        },
      ],
    },
  });
});

test("shows route legs in index order with only their own validation results", async () => {
  const screen = await renderComponent(
    <FlightValidationContext.Provider value={validation}>
      <FlightRoute callsign="CCA123" />
    </FlightValidationContext.Provider>,
  );
  const rows = screen.getByRole("row");
  await expect.element(rows.nth(1).getByRole("cell").nth(0)).toHaveTextContent("3");
  await expect.element(rows.nth(1).getByRole("cell").nth(1)).toHaveTextContent("ALPHA");
  await expect.element(rows.nth(1).getByRole("cell").nth(2)).toHaveTextContent("DCT");
  await expect.element(rows.nth(2).getByRole("cell").nth(0)).toHaveTextContent("4");
  await expect.element(rows.nth(2).getByRole("cell").nth(1)).toHaveTextContent("BRAVO");
  await expect.element(rows.nth(2).getByRole("cell").nth(2)).toHaveTextContent("A1");
  expect(rows.nth(1).getByRole("button").all()).toHaveLength(1);
  expect(rows.nth(2).getByRole("button").all()).toHaveLength(1);
  expect(screen.getByRole("heading", { level: 3 }).getByRole("button").all()).toHaveLength(1);
});

test("does not fetch the restricted route for users without the engineer role", async () => {
  mocks.permissions.mockReturnValue(["user"]);
  const screen = await renderComponent(
    <RequireRole role="software-engineer">
      <FlightRoute callsign="CCA123" />
    </RequireRole>,
  );
  await expect.element(screen.getByText("Resolved Route")).not.toBeInTheDocument();
  expect(mocks.query).not.toHaveBeenCalled();
});

test("shows route errors within the route section", async () => {
  mocks.query.mockReturnValue({ error: { title: "Invalid route", detail: "Cannot parse route" } });
  const screen = await renderComponent(<FlightRoute callsign="CCA123" />);
  await expect.element(screen.getByText("Cannot parse route")).toBeVisible();
});
