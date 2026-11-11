import { ConfirmButton } from "./confirm-button";
import { DateTimeInput } from "./datetime-input";
import { Button, Checkbox, Menu, Modal, Select, Tabs, useColorScheme } from "./index";
import { renderComponent } from "@/test/render-component";
import { useState } from "react";
import { expect, test, vi } from "vitest";
import { userEvent } from "vitest/browser";

test("searches and clears a controlled selector inside a modal", async () => {
  function Example() {
    const [value, setValue] = useState<string | null>(null);
    return (
      <Modal opened onClose={() => undefined} title="Assign controller">
        <Select
          label="Controller"
          searchable
          clearable
          data={[
            { value: "1", label: "Zhan Long Bei (1234567)" },
            { value: "2", label: "Other User" },
          ]}
          value={value}
          onChange={setValue}
        />
        <output>{value ?? "None"}</output>
      </Modal>
    );
  }
  const screen = await renderComponent(<Example />);
  await screen.getByRole("combobox", { name: "Controller" }).fill("Zhan");
  await screen.getByRole("option", { name: "Zhan Long Bei (1234567)" }).click();
  await expect.element(screen.getByRole("status")).toHaveTextContent("1");
  await screen.getByRole("button", { name: "Clear selection" }).click();
  await expect.element(screen.getByRole("status")).toHaveTextContent("None");
});

test("confirmation requires a second action and Escape dismisses the popover", async () => {
  const action = vi.fn();
  const screen = await renderComponent(
    <ConfirmButton onClick={action} actionDescription="Delete this record?">
      Delete
    </ConfirmButton>,
  );
  await screen.getByRole("button", { name: "Delete", exact: true }).click();
  await expect.element(screen.getByText("Delete this record?")).toBeVisible();
  expect(action).not.toHaveBeenCalled();
  await userEvent.keyboard("{Escape}");
  await expect.element(screen.getByText("Delete this record?")).not.toBeInTheDocument();
  await screen.getByRole("button", { name: "Delete", exact: true }).click();
  await screen.getByRole("dialog").getByRole("button", { name: "Delete", exact: true }).click();
  expect(action).toHaveBeenCalledTimes(1);
});

test("tabs and grouped checkboxes update through HeroUI controls", async () => {
  function Example() {
    const [checked, setChecked] = useState<string[]>([]);
    return (
      <Tabs defaultValue="one">
        <Tabs.List>
          <Tabs.Tab value="one">First</Tabs.Tab>
          <Tabs.Tab value="two">Second</Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="one">First panel</Tabs.Panel>
        <Tabs.Panel value="two">
          <Checkbox.Group value={checked} onChange={setChecked}>
            <Checkbox value="mentor" label="Mentor" />
          </Checkbox.Group>
          <output>{checked.join(",")}</output>
        </Tabs.Panel>
      </Tabs>
    );
  }
  const screen = await renderComponent(<Example />);
  await screen.getByRole("tab", { name: "Second" }).click();
  await screen.getByRole("checkbox", { name: "Mentor" }).click();
  await expect.element(screen.getByRole("status")).toHaveTextContent("mentor");
});

test("UTC datetime inputs emit UTC instants and can be cleared", async () => {
  const change = vi.fn();
  const screen = await renderComponent(
    <DateTimeInput label="Start UTC" value="2026-11-10T12:00:00Z" onChange={change} clearable />,
  );
  await screen.getByLabelText("Start UTC").fill("2026-11-11T13:45");
  expect(change).toHaveBeenLastCalledWith("2026-11-11T13:45:00.000Z");
  await screen.getByRole("button", { name: "Clear date" }).click();
  expect(change).toHaveBeenLastCalledWith(null);
});

test("loading preserves the button name and prevents duplicate submissions", async () => {
  const click = vi.fn();
  const screen = await renderComponent(
    <Button loading onClick={click}>
      Save
    </Button>,
  );
  await expect.element(screen.getByRole("button", { name: "Save", exact: true })).toBeDisabled();
});

test("navigation menus support keyboard actions and Escape", async () => {
  const action = vi.fn();
  const screen = await renderComponent(
    <Menu>
      <Menu.Target>
        <Button>Account menu</Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item onClick={action}>Profile</Menu.Item>
        <Menu.Item>Settings</Menu.Item>
      </Menu.Dropdown>
    </Menu>,
  );
  await screen.getByRole("button", { name: "Account menu" }).click();
  await expect.element(screen.getByRole("menuitem", { name: "Profile" })).toBeVisible();
  await userEvent.keyboard("{End}{Enter}");
  await screen.getByRole("button", { name: "Account menu" }).click();
  await screen.getByRole("menuitem", { name: "Profile" }).click();
  expect(action).toHaveBeenCalledTimes(1);
  await screen.getByRole("button", { name: "Account menu" }).click();
  await userEvent.keyboard("{Escape}");
  await expect.element(screen.getByRole("menuitem", { name: "Profile" })).not.toBeInTheDocument();
});

test("link buttons retain native link semantics and destinations", async () => {
  const screen = await renderComponent(
    <Button component="a" href="/events">
      All events
    </Button>,
  );
  await expect.element(screen.getByRole("link", { name: "All events" })).toHaveAttribute("href", "/events");
});

test("color scheme controls persist the preference and update HeroUI's theme", async () => {
  function Example() {
    const { setColorScheme } = useColorScheme();
    return (
      <>
        <Button onClick={() => setColorScheme("dark")}>Dark appearance</Button>
        <Button onClick={() => setColorScheme("auto")}>System appearance</Button>
      </>
    );
  }
  const screen = await renderComponent(<Example />);
  await screen.getByRole("button", { name: "Dark appearance" }).click();
  expect(document.documentElement.dataset.theme).toBe("dark");
  expect(document.cookie).toContain("vatprc-color-scheme=dark");
  await screen.getByRole("button", { name: "System appearance" }).click();
  expect(document.documentElement.dataset.theme).toBe(
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );
  document.cookie = "vatprc-color-scheme=; Path=/; Max-Age=0";
});
