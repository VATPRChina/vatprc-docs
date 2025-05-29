import { useMantineColorScheme, ActionIcon, useComputedColorScheme } from "@mantine/core";
import { TbSun, TbMoon } from "react-icons/tb";

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
      {computedColorScheme === "light" ? <TbSun width="70%" height="70%" /> : <TbMoon width="70%" height="70%" />}
    </ActionIcon>
  );
};
