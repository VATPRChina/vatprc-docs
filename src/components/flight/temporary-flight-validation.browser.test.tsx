import { TemporaryFlightValidation } from "./temporary-flight-validation";
import type { components } from "@/lib/api";
import { renderComponent } from "@/test/render-component";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, expect, test, vi } from "vitest";
import { page } from "vitest/browser";

const mocks = vi.hoisted(() => ({ get: vi.fn(), permissions: vi.fn() }));
vi.mock("@/lib/client", () => ({ usePermissions: mocks.permissions }));
vi.mock("@/lib/client/client", () => ({ client: { GET: mocks.get } }));

const validation: components["schemas"]["FlightValidationDto"] = {
  validators: [
    { id: "aircraft-type", field: { kind: "aircraft-type" }, status: "pass", problems: [] },
    { id: "preferred-route", field: { kind: "multiple-legs", from: 2, to: 4 }, status: "suppressed", problems: [] },
    {
      id: "preferred-route-cruise-altitude",
      field: { kind: "multiple-legs", from: 2, to: 4 },
      status: "unavailable",
      problems: [],
    },
    {
      id: "route-unknown-leg-or-fix",
      field: { kind: "leg", index: 2 },
      status: "rejected",
      problems: [{ kind: "route-unknown-leg-or-fix", ident: "BADFIX" }],
    },
  ],
};

beforeEach(() => {
  mocks.permissions.mockReturnValue(["software-engineer"]);
  mocks.get.mockReset();
  mocks.get.mockResolvedValue({ data: validation, response: { statusText: "OK" } });
});

function renderForm() {
  return renderComponent(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
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

test("submits the full normalized plan on demand and shows every validation status with its scope", async () => {
  const screen = await renderForm();
  expect(mocks.get).not.toHaveBeenCalled();
  await fillRequired(screen);
  await screen.getByLabelText("Equipment", { exact: true }).fill("rw");
  await screen.getByLabelText("Transponder", { exact: true }).fill("lb1");
  await screen.getByLabelText("PBN", { exact: true }).fill("d1");
  await screen.getByRole("button", { name: "Run Validation" }).click();
  await expect.element(screen.getByText("Last validated flight plan")).toBeVisible();
  expect(mocks.get).toHaveBeenCalledExactlyOnceWith("/api/flights/temporary/by-plan/validation", {
    params: {
      query: {
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
      },
    },
  });
  for (const status of ["Pass", "Suppressed", "Unavailable", "Rejected"]) {
    await expect.element(screen.getByText(status, { exact: true })).toBeVisible();
  }
  await expect.element(screen.getByText("Leg 3", { exact: true })).toBeVisible();
  await expect.element(screen.getByText(/BADFIX/)).toBeVisible();
  expect(screen.getByRole("link").all()).toHaveLength(0);
  await page.screenshot({
    path: "../../../.vitest/temporary-flight-validation.png",
  });
  await page.viewport(390, 844);
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth);
  await page.screenshot({
    path: "../../../.vitest/temporary-flight-validation-mobile.png",
  });
  await page.viewport(1024, 768);
  await screen.getByLabelText("Route", { exact: true }).fill("dct");
  expect(mocks.get).toHaveBeenCalledTimes(1);
  await expect.element(screen.getByText("LEKEN V611 LELIM", { exact: true })).toBeVisible();
  await screen.getByRole("button", { name: "Run Validation" }).click();
  await expect.poll(() => mocks.get.mock.calls.length).toBe(2);
  await expect
    .element(screen.getByRole("region", { name: "Validation Result" }).getByText("DCT", { exact: true }))
    .toBeVisible();
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
  mocks.get.mockResolvedValueOnce({
    error: { title: "Invalid route", detail: "Cannot parse route" },
    response: { statusText: "Bad Request" },
  });
  const screen = await renderForm();
  await fillRequired(screen);
  await screen.getByRole("button", { name: "Run Validation" }).click();
  await expect.element(screen.getByText("Cannot parse route")).toBeVisible();
  await screen.getByRole("button", { name: "Run Validation" }).click();
  await expect.element(screen.getByText("Last validated flight plan")).toBeVisible();
  await expect.element(screen.getByText("Cannot parse route")).not.toBeInTheDocument();
  expect(mocks.get).toHaveBeenCalledTimes(2);
});

test("disables submission while a validation request is pending", async () => {
  let finish!: (value: unknown) => void;
  mocks.get.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    }),
  );
  const screen = await renderForm();
  await fillRequired(screen);
  await screen.getByRole("button", { name: "Run Validation" }).click();
  await expect.element(screen.getByRole("button", { name: "Run Validation" })).toBeDisabled();
  await screen.getByLabelText("Route", { exact: true }).fill("DCT");
  finish({ data: validation, response: { statusText: "OK" } });
  await expect.element(screen.getByText("LEKEN V611 LELIM", { exact: true })).toBeVisible();
  expect(mocks.get).toHaveBeenCalledTimes(1);
});
