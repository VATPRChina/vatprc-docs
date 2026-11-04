import { ProblemDetails } from "./message";
import { FlightValidationContext, ValidationResult } from "./validation";
import type { components } from "@/lib/api";
import { renderComponent } from "@/test/render-component";
import { expect, test } from "vitest";

const altitude = {
  cruising_level_restriction: "standard-even",
  allowed_altitudes: [32100, 34100],
  minimal_altitude: 32100,
} as const;
const requirements = { ...altitude, allowed_altitudes: [...altitude.allowed_altitudes] };

test.each([false, true])(
  "groups preferred alternatives into one message with newline-separated routes (temporary=%s)",
  async (temporary) => {
    const validation: components["schemas"]["FlightValidationDto"] = {
      validators: [
        {
          id: "preferred-route",
          field: { kind: "multiple-legs", from: 2, to: 5 },
          status: "rejected",
          problems: [
            {
              kind: "not-preferred-route",
              routes: [
                { ...requirements, from: "VHHH", to: "LELIM", raw_route: "LEKEN V611 LELIM" },
                { ...requirements, from: "VHHH", to: "DOTMI", raw_route: "LEKEN V601 DOTMI" },
              ],
            },
          ],
        },
      ],
    };
    const screen = await renderComponent(
      <FlightValidationContext.Provider value={validation}>
        <ValidationResult temporary={temporary} />
      </FlightValidationContext.Provider>,
    );
    await expect.element(screen.getByRole("alert", { name: /Not designated route/ })).toBeVisible();
    expect(screen.getByRole("alert", { name: /Not designated route/ }).all()).toHaveLength(1);
    expect(document.querySelectorAll("pre code")).toHaveLength(1);
    expect(document.querySelector("pre code")?.textContent).toBe(
      "VHHH → LELIM: LEKEN V611 LELIM\nRequired cruising altitude: metric even flight level. Allowed altitudes: 32100 ft, 34100 ft. Minimum altitude: 32100 ft.\nVHHH → DOTMI: LEKEN V601 DOTMI\nRequired cruising altitude: metric even flight level. Allowed altitudes: 32100 ft, 34100 ft. Minimum altitude: 32100 ft.",
    );
    expect(document.querySelector("pre")?.classList.contains("whitespace-pre-wrap")).toBe(true);
  },
);

test("shows the matched route's endpoints and raw route", async () => {
  const validation: components["schemas"]["FlightValidationDto"] = {
    validators: [
      {
        id: "preferred-route",
        field: { kind: "multiple-legs", from: 0, to: 3 },
        status: "pass",
        problems: [
          { ...requirements, kind: "route-match-preferred", from: "VHHH", to: "LELIM", raw_route: "LEKEN V611 LELIM" },
        ],
      },
    ],
  };
  const screen = await renderComponent(
    <FlightValidationContext.Provider value={validation}>
      <ValidationResult />
    </FlightValidationContext.Provider>,
  );
  await expect
    .element(screen.getByText("The planned route matches the designated route from VHHH to LELIM."))
    .toBeVisible();
  await expect.element(screen.getByText("LEKEN V611 LELIM", { exact: true })).toBeVisible();
  await expect.element(screen.getByText(/Required cruising altitude: metric even flight level/)).toBeVisible();
  await expect.element(screen.getByText(/Allowed altitudes: 32100 ft, 34100 ft/)).toBeVisible();
  await expect.element(screen.getByText(/Minimum altitude: 32100 ft/)).toBeVisible();
  expect(screen.getByRole("link").all()).toHaveLength(0);
});

test("shows imperial requirements without inventing allowed or minimum altitudes", async () => {
  const screen = await renderComponent(
    <ProblemDetails
      problem={{
        kind: "route-match-preferred",
        from: "VHHH",
        to: "LELIM",
        raw_route: "LEKEN V611 LELIM",
        cruising_level_restriction: "flight-level-odd",
        allowed_altitudes: [],
        minimal_altitude: 0,
      }}
    />,
  );
  await expect.element(screen.getByText("Required cruising altitude: imperial odd flight level.")).toBeVisible();
  expect(screen.getByText(/Allowed altitudes:/).all()).toHaveLength(0);
  expect(screen.getByText(/Minimum altitude:/).all()).toHaveLength(0);
});
