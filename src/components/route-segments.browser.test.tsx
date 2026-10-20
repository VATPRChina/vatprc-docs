import { RouteSegments } from "./route-segments";
import { renderComponent } from "@/test/render-component";
import { expect, test } from "vitest";

const fix = (identifier: string) => ({ identifier, latitude: 30, longitude: 120, is_unknown: false });

test("shows segment ranges, terminal airports and known endpoints around unknown border chains", async () => {
  const screen = await renderComponent(
    <RouteSegments
      segments={[
        {
          identifier: "OLIVE-ZSPD",
          kind: "mainland",
          start_index: 3,
          end_index: 18,
          route_start_airport: null,
          route_end_airport: fix("ZSPD"),
          enroute_start_fix: fix("PIANO"),
          enroute_end_fix: fix("BK"),
          cross_border_enter_start_fix: fix("OLIVE"),
          cross_border_enter_end_fix: fix("SULEM"),
          cross_border_exit_start_fix: null,
          cross_border_exit_end_fix: null,
        },
      ]}
    />,
  );
  await expect.element(screen.getByRole("region", { name: "Route segments" })).toBeVisible();
  await expect.element(screen.getByText("1. OLIVE-ZSPD", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("China mainland", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("Leg range: [3, 18)", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("— → ZSPD", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("PIANO → BK", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("OLIVE → SULEM", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("—", { exact: true })).toBeVisible();
  await screen.rerender(<RouteSegments segments={[]} />);
  await expect.element(screen.getByText("No route segments.")).toBeVisible();
  await expect.element(screen.getByText("1. OLIVE-ZSPD", { exact: true })).not.toBeInTheDocument();
});

test("displays an international portion with its own airport and range", async () => {
  const screen = await renderComponent(
    <RouteSegments
      segments={[
        {
          kind: "international",
          identifier: "EDDK-BERTO",
          start_index: 0,
          end_index: 91,
          route_start_airport: fix("EDDK"),
          route_end_airport: null,
          enroute_start_fix: fix("KUMIK"),
          enroute_end_fix: fix("BERTO"),
        },
      ]}
    />,
  );
  await expect.element(screen.getByText("International", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("1. EDDK-BERTO", { exact: true })).toBeVisible();
  await expect.element(screen.getByText("KUMIK → BERTO", { exact: true })).toBeVisible();
});
