import { ControllerCenterLoginPlaceholder } from "./login-placeholder";
import { renderComponent } from "@/test/render-component";
import { expect, test, vi } from "vitest";

vi.mock("@/lib/client", () => ({ redirectToLogin: vi.fn() }));

test("renders the styled login placeholder", async () => {
  const screen = await renderComponent(
    <div className="w-[720px] bg-white p-6" data-testid="component-test-surface">
      <ControllerCenterLoginPlaceholder />
    </div>,
  );

  await expect.element(screen.getByRole("heading", { name: "Log in to Controller Center" })).toBeVisible();
  await expect.element(screen.getByRole("button", { name: "Login" })).toBeVisible();
  await screen.getByTestId("component-test-surface").screenshot();
});
