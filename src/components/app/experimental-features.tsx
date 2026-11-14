import { DropdownMenuSeparator, DropdownMenuLabel, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { newNavigationAtom } from "@/lib/experimental-features";
import { Trans } from "@lingui/react/macro";
import { useAtom } from "jotai";

export const ExperimentalFeatures = () => {
  const [newNavigation, setNewNavigation] = useAtom(newNavigationAtom);

  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>
        <Trans>Experimental features</Trans>
      </DropdownMenuLabel>
      <DropdownMenuCheckboxItem checked={newNavigation} closeOnClick={false} onCheckedChange={setNewNavigation}>
        <Trans>New navigation</Trans>
      </DropdownMenuCheckboxItem>
      <DropdownMenuSeparator />
    </>
  );
};
