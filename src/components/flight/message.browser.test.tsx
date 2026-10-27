import { FlightValidationContext, ValidationResult } from "./validation";
import type { components } from "@/lib/api";
import { renderComponent } from "@/test/render-component";
import { expect, test } from "vitest";

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
                { from: "VHHH", to: "LELIM", raw_route: "LEKEN V611 LELIM" },
                { from: "VHHH", to: "DOTMI", raw_route: "LEKEN V601 DOTMI" },
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
      "VHHH → LELIM: LEKEN V611 LELIM\nVHHH → DOTMI: LEKEN V601 DOTMI",
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
        problems: [{ kind: "route-match-preferred", from: "VHHH", to: "LELIM", raw_route: "LEKEN V611 LELIM" }],
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
