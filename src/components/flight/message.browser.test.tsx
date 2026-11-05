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
  "groups preferred alternatives into one message with each route's altitude requirements (temporary=%s)",
  async (temporary) => {
    const alternatives = [
      { ...requirements, from: "VHHH", to: "LELIM", raw_route: "LEKEN V611 LELIM" },
      { ...requirements, from: "VHHH", to: "DOTMI", raw_route: "LEKEN V601 DOTMI" },
    ];
    const validation: components["schemas"]["FlightValidationDto"] = {
      validators: [
        {
          id: "preferred-route",
          field: { kind: "multiple-legs", from: 2, to: 5 },
          status: "rejected",
          problems: [
            {
              kind: "not-preferred-route",
              routes: alternatives,
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
    const alert = screen.getByRole("alert", { name: /Not designated route/ });
    await expect.element(alert).toBeVisible();
    expect(alert.all()).toHaveLength(1);
    const routes = alert.getByRole("listitem");
    expect(routes.all()).toHaveLength(2);
    for (const [index, { to, raw_route }] of alternatives.entries()) {
      await expect.element(routes.nth(index)).toMatchTextContent(`From VHHH to ${to}, use`);
      await expect.element(routes.nth(index).getByRole("code")).toHaveTextContent(raw_route);
      await expect.element(routes.nth(index)).toMatchTextContent(/with crusing level of 32100 ft, 34100 ft\./);
      await expect.element(routes.nth(index)).toMatchTextContent(/Keep curising level not below 32100 feet\./);
      expect(
        routes
          .nth(index)
          .getByText(/metric even flight level/)
          .all(),
      ).toHaveLength(0);
    }
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
  expect(screen.getByRole("link").all()).toHaveLength(0);
});

test("shows imperial requirements without inventing allowed or minimum altitudes", async () => {
  const screen = await renderComponent(
    <ProblemDetails
      problem={{
        kind: "not-preferred-route",
        routes: [
          {
            from: "VHHH",
            to: "LELIM",
            raw_route: "LEKEN V611 LELIM",
            cruising_level_restriction: "flight-level-odd",
            allowed_altitudes: [],
            minimal_altitude: 0,
          },
        ],
      }}
    />,
  );
  await expect
    .element(screen.getByRole("listitem"))
    .toHaveTextContent("From VHHH to LELIM, use LEKEN V611 LELIM, with imperial odd flight level.");
});
