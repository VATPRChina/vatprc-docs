import { QuarterlyControllingTime } from "./quarterly-controlling-time";
import { components } from "@/lib/api";
import { renderComponent } from "@/test/render-component";
import { expect, test, vi } from "vitest";
import { page } from "vitest/browser";

const { onlineTime } = vi.hoisted(() => ({
  onlineTime: {
    period: "2026Q4",
    period_start: "2026-10-01T00:00:00Z",
    as_of: "2026-10-15T12:00:00Z",
    total_seconds: 36_000,
    by_position: { S1: 3600, S2: 7200, S3: 10_800, "C1+": 14_400 },
    lifetime: {
      total_seconds: 360_000,
      by_position: { S1: 36_000, S2: 72_000, S3: 108_000, "C1+": 144_000 },
    },
  } satisfies components["schemas"]["ControllerOnlineTimeDto"],
}));

vi.mock("@/lib/client", () => ({
  $api: { useQuery: () => ({ data: onlineTime, error: null, isLoading: false }) },
}));

test.each([320, 1280])("shows five cards with quarter and lifetime hours at %ipx", async (width) => {
  await page.viewport(width, 1280);
  const screen = await renderComponent(
    <div style={{ width }} className="bg-white p-2" data-testid="controlling-history">
      <QuarterlyControllingTime />
    </div>,
  );

  await expect.element(screen.getByText("2026Q4", { exact: true })).toBeVisible();
  expect(screen.getByRole("article").all()).toHaveLength(5);
  for (const [index, rating] of ["S1", "S2", "S3", "C1"].entries()) {
    const card = screen.getByRole("article", { name: rating, exact: true });
    await expect.element(card.getByText("Current quarter", { exact: true })).toBeVisible();
    await expect.element(card.getByText("Lifetime", { exact: true })).toBeVisible();
    await expect.element(card.getByText(`${index + 1}.0h`, { exact: true })).toBeVisible();
    await expect.element(card.getByText(`${(index + 1) * 10}.0h`, { exact: true })).toBeVisible();
  }
  const total = screen.getByRole("article", { name: "Total", exact: true });
  await expect.element(total.getByText("10.0h", { exact: true })).toBeVisible();
  await expect.element(total.getByText("100.0h", { exact: true })).toBeVisible();
  await expect.element(screen.getByRole("heading", { name: "C1+", exact: true })).not.toBeInTheDocument();
  await screen.getByTestId("controlling-history").screenshot();
});
