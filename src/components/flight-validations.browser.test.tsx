import { ValidationTag } from "./flight-validations";
import type { components } from "@/lib/api";
import { renderComponent } from "@/test/render-component";
import { expect, test } from "vitest";

test("keeps repeated validators distinct and opens their results", async () => {
  const results: components["schemas"]["ValidatorResult"][] = [
    {
      validator_ident: "route-preferred",
      field: "route",
      status: "pass",
      warnings: [],
      scope: { level: "segment", segment_index: 0, start_leg_index: 0, end_leg_index: 2 },
    },
    {
      validator_ident: "route-preferred",
      field: "route",
      status: "rejected",
      warnings: [],
      scope: { level: "segment", segment_index: 1, start_leg_index: 2, end_leg_index: 4 },
    },
    {
      validator_ident: "route-direct-leg",
      field: "route",
      status: "suppressed",
      warnings: [],
      scope: { level: "leg", segment_index: 1, leg_index: 2 },
    },
    { validator_ident: "callsign", field: "callsign", status: "unavailable", warnings: [], scope: { level: "flight" } },
  ];
  const screen = await renderComponent(
    <div>
      {results.map((result) => (
        <ValidationTag key={`${result.validator_ident}:${JSON.stringify(result.scope)}`} result={result} />
      ))}
    </div>,
  );
  await expect.element(screen.getByRole("button", { name: "designated route: P" })).toBeVisible();
  const second = screen.getByRole("button", { name: "designated route: R" });
  await expect.element(second).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "no direct route legs: S" })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "callsign: U" })).toBeVisible();
  await second.click();
  await expect.element(screen.getByText("Rejected", { exact: true })).toBeVisible();
});

test("shows airport wingspan rejection details and manual-check unavailability", async () => {
  const screen = await renderComponent(
    <div>
      <ValidationTag
        result={{
          validator_ident: "departure-aircraft-type",
          field: "departure",
          scope: { level: "flight" },
          status: "rejected",
          warnings: [
            {
              message_code: "aircraft-wingspan-too-large",
              field: "departure",
              parameter: "ZBAL: B738 (35.8 m; ≤ 30 m)",
            },
          ],
        }}
      />
      <ValidationTag
        result={{
          validator_ident: "arrival-aircraft-type",
          field: "arrival",
          scope: { level: "flight" },
          status: "unavailable",
          warnings: [{ message_code: "aircraft-wingspan-manual-check", field: "arrival", parameter: "ZBHH: B748" }],
        }}
      />
    </div>,
  );
  const departure = screen.getByRole("button", { name: "wingspan limit at departure: R" });
  await departure.click();
  await expect
    .element(screen.getByText("The aircraft wingspan exceeds the airport's limit.", { exact: true }))
    .toBeVisible();
  await expect.element(screen.getByText("ZBAL: B738 (35.8 m; ≤ 30 m)", { exact: true })).toBeVisible();
  await departure.click();
  await screen.getByRole("button", { name: "wingspan limit at arrival: U" }).click();
  await expect.element(screen.getByText("Unavailable", { exact: true })).toBeVisible();
  await expect
    .element(
      screen.getByText("This aircraft requires a controller's manual compatibility check at this airport.", {
        exact: true,
      }),
    )
    .toBeVisible();
});
