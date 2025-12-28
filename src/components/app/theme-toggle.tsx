import { Trans } from "@lingui/react/macro";
import { ActionIcon, Menu, useMantineColorScheme } from "@mantine/core";
import { TbMoon, TbSun } from "react-icons/tb";

export function ModeToggle() {
  const { setColorScheme, toggleColorScheme, clearColorScheme } = useMantineColorScheme();

  return (
    <Menu trigger="hover">
      <Menu.Target>
        <ActionIcon variant="subtle" onClick={() => toggleColorScheme()} color="gray">
          <TbSun className="not-dark:block dark:hidden" />
          <TbMoon className="not-dark:hidden dark:block" />
          <span className="sr-only">
            <Trans>Toggle theme</Trans>
          </span>
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <ul className="flex cursor-default flex-col">
          <Menu.Item onClick={() => setColorScheme("light")}>
            <Trans>Light</Trans>
          </Menu.Item>
          <Menu.Item onClick={() => setColorScheme("dark")}>
            <Trans>Dark</Trans>
          </Menu.Item>
          <Menu.Item onClick={() => clearColorScheme()}>
            <Trans>System</Trans>
          </Menu.Item>
        </ul>
      </Menu.Dropdown>
    </Menu>
  );
}
