import { Button } from "@/components/ui/button";
import { PopoverTrigger, PopoverContent, Popover } from "@/components/ui/popover";
import { Trans } from "@lingui/react/macro";
import { useState as useDisclosureState } from "react";
import { FC, ReactNode, ComponentProps } from "react";

type ConfirmButtonProps = ComponentProps<typeof Button> & {
  actionDescription: ReactNode;
};

export const ConfirmButton: FC<ConfirmButtonProps> = (props) => {
  const { onClick, actionDescription, type, ...rest } = props;

  const [opened, setOpened] = useDisclosureState(false);
  const open = () => setOpened(true);
  const close = () => setOpened(false);

  const handleClick: ConfirmButtonProps["onClick"] = (e) => {
    onClick?.(e);
    close();
  };

  return (
    <Popover
      open={opened}
      onOpenChange={(open) => {
        if (!open) close();
      }}
    >
      <PopoverTrigger render={<Button {...rest} />} onClick={open} />
      <PopoverContent>
        <div className="flex flex-col items-start gap-2">
          {actionDescription}
          <div className="flex flex-row gap-1">
            <Button size="xs" onClick={close} variant={"neutral"}>
              <Trans>No</Trans>
            </Button>
            <Button {...rest} type={type} size="xs" onClick={handleClick} variant={"neutral"} />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
