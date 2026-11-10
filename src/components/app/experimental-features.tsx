import { newNavigationAtom } from "@/lib/experimental-features";
import { Trans } from "@lingui/react/macro";
import { Menu } from "@mantine/core";
import { useAtom } from "jotai";
import { TbCheck } from "react-icons/tb";

export const ExperimentalFeatures = () => {
  const [newNavigation, setNewNavigation] = useAtom(newNavigationAtom);

  return (
    <>
      <Menu.Divider />
      <Menu.Label>
        <Trans>Experimental features</Trans>
      </Menu.Label>
      <Menu.Item
        role="menuitemcheckbox"
        aria-checked={newNavigation}
        closeMenuOnClick={false}
        onClick={() => setNewNavigation((enabled) => !enabled)}
        rightSection={<TbCheck aria-hidden style={{ visibility: newNavigation ? "visible" : "hidden" }} />}
      >
        <Trans>New navigation</Trans>
      </Menu.Item>
      <Menu.Divider />
    </>
  );
};
