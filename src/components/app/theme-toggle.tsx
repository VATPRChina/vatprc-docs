import { useColorScheme } from "./theme-provider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { isColorScheme } from "@/lib/settings";
import { useLingui } from "@lingui/react/macro";
import { TbDeviceDesktop, TbMoon, TbSun } from "react-icons/tb";

export function ModeToggle({ text = false }: { text?: boolean }) {
  const { colorScheme, setColorScheme } = useColorScheme();
  const { t } = useLingui();
  return (
    <ToggleGroup
      value={[colorScheme]}
      onValueChange={(values) => {
        const value = values[0];
        if (value && isColorScheme(value)) setColorScheme(value);
      }}
    >
      <ToggleGroupItem value="light" aria-label={t`Light`}>
        {text ? t`Light` : <TbSun size={16} />}
      </ToggleGroupItem>
      <ToggleGroupItem value="dark" aria-label={t`Dark`}>
        {text ? t`Dark` : <TbMoon size={16} />}
      </ToggleGroupItem>
      <ToggleGroupItem value="auto" aria-label={t`System`}>
        {text ? t`System` : <TbDeviceDesktop size={16} />}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}

export function ModeToggleSegmented() {
  return <ModeToggle text />;
}
