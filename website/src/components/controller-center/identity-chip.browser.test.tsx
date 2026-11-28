import { IdentityChip } from "./identity-chip";
import { renderComponent } from "@/test/render-component";
import { expect, test, vi } from "vitest";

const { useUser, useStatus } = vi.hoisted(() => ({
  useUser: vi.fn<() => { cid: number } | undefined>(),
  useStatus: vi.fn<() => { data?: { rating: string; is_visiting: boolean; is_absent: boolean } }>(),
}));

vi.mock("@/lib/client", () => ({ useUser, $api: { useQuery: useStatus } }));

test.each([undefined, { cid: 1234567 }])("hides the identity until user and status are available", async (user) => {
  useUser.mockReturnValue(user);
  useStatus.mockReturnValue({});
  const screen = await renderComponent(<IdentityChip />);
  expect(screen.container.innerText).toBe("");
});

test.each([
  [false, false],
  [true, false],
  [false, true],
  [true, true],
])("shows the controller identity with visiting=%s and absent=%s", async (visiting, absent) => {
  useUser.mockReturnValue({ cid: 1234567 });
  useStatus.mockReturnValue({ data: { rating: "C1", is_visiting: visiting, is_absent: absent } });
  const screen = await renderComponent(<IdentityChip />);
  await expect.element(screen.getByText("1234567 · C1")).toBeVisible();
  expect(screen.getByText("Visiting", { exact: true }).all()).toHaveLength(Number(visiting));
  expect(screen.getByText("Absent", { exact: true }).all()).toHaveLength(Number(absent));
});
