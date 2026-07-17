import { nextColorScheme } from "@/lib/color-scheme";
import { isColorScheme } from "@/lib/settings";
import { useLingui } from "@lingui/react/macro";
import { ActionIcon, SegmentedControl, useMantineColorScheme } from "@mantine/core";
import { TbDeviceDesktop, TbMoon, TbSun } from "react-icons/tb";

export function ModeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { t } = useLingui();

  const label =
    colorScheme === "light"
      ? t`Color scheme: light`
      : colorScheme === "dark"
        ? t`Color scheme: dark`
        : t`Color scheme: follow system`;

  return (
    <ActionIcon
      variant="subtle"
      color="gray"
      onClick={() => setColorScheme(nextColorScheme(colorScheme))}
      aria-label={label}
      title={label}
    >
      {colorScheme === "light" && <TbSun />}
      {colorScheme === "dark" && <TbMoon />}
      {colorScheme === "auto" && <TbDeviceDesktop />}
    </ActionIcon>
  );
}

export function ModeToggleSegmented() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { t } = useLingui();

  return (
    <SegmentedControl
      value={colorScheme}
      onChange={(value) => isColorScheme(value) && setColorScheme(value)}
      data={[
        { value: "light", label: t`Light` },
        { value: "dark", label: t`Dark` },
        { value: "auto", label: t`System` },
      ]}
    />
  );
}
