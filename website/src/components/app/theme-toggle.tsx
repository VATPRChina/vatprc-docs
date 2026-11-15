import { isColorScheme } from "@/lib/settings";
import { Trans, useLingui } from "@lingui/react/macro";
import { SegmentedControl, useMantineColorScheme, VisuallyHidden } from "@mantine/core";
import { TbDeviceDesktop, TbMoon, TbSun } from "react-icons/tb";

export function ModeToggle() {
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  return (
    <SegmentedControl
      size="xs"
      value={colorScheme}
      onChange={(value) => isColorScheme(value) && setColorScheme(value)}
      data={[
        {
          value: "light",
          label: (
            <span className="flex items-center">
              <TbSun size={16} />
              <VisuallyHidden>
                <Trans>Light</Trans>
              </VisuallyHidden>
            </span>
          ),
        },
        {
          value: "dark",
          label: (
            <span className="flex items-center">
              <TbMoon size={16} />
              <VisuallyHidden>
                <Trans>Dark</Trans>
              </VisuallyHidden>
            </span>
          ),
        },
        {
          value: "auto",
          label: (
            <span className="flex items-center">
              <TbDeviceDesktop size={16} />
              <VisuallyHidden>
                <Trans>System</Trans>
              </VisuallyHidden>
            </span>
          ),
        },
      ]}
    />
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
