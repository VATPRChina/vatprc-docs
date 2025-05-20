import {
  useMantineColorScheme,
  ActionIcon,
  useComputedColorScheme,
} from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";

export const ColorSchemeToggle = () => {
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const { toggleColorScheme } = useMantineColorScheme();
  return (
    <ActionIcon
      variant="subtle"
      c="gray"
      onClick={() => {
        toggleColorScheme();
      }}
    >
      {computedColorScheme === "light" ? (
        <IconSun width="70%" height="70%" />
      ) : (
        <IconMoon width="70%" height="70%" />
      )}
    </ActionIcon>
  );
};
