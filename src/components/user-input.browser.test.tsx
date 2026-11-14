import { UserInput } from "./user-input";
import { renderComponent } from "@/test/render-component";
import { useState } from "react";
import { expect, test, vi } from "vitest";

const users = vi.hoisted(() => [
  { id: "user-1", full_name: "Zhan Long Bei", cid: "1234567" },
  { id: "user-2", full_name: "Another Controller", cid: "7654321" },
]);
vi.mock("@/lib/client", () => ({ $api: { useQuery: () => ({ data: users, isLoading: false }) } }));

function UserPicker() {
  const [value, setValue] = useState<string | null>(null);
  return (
    <>
      <UserInput aria-label="Controller" value={value} onChange={setValue} />
      <output>{value ?? "none"}</output>
    </>
  );
}

test("searches names without spaces, selects a user ID and clears the selection", async () => {
  const screen = await renderComponent(<UserPicker />);
  await screen.getByRole("button", { name: "Controller" }).click();
  await screen.getByRole("combobox", { name: "Search users" }).fill("zhanlong");
  await expect.element(screen.getByRole("option", { name: "Another Controller (7654321)" })).not.toBeInTheDocument();
  await screen.getByRole("option", { name: "Zhan Long Bei (1234567)" }).click();
  await expect.element(screen.getByRole("status")).toHaveTextContent("user-1");
  await expect.element(screen.getByRole("button", { name: "Controller" })).toHaveTextContent("Zhan Long Bei (1234567)");
  await screen.getByRole("button", { name: "Controller" }).click();
  await screen.getByRole("option", { name: "Clear selection" }).click();
  await expect.element(screen.getByRole("status")).toHaveTextContent("none");
});
