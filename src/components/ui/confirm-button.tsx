import { Trans } from "@lingui/react/macro";
import { Button, ButtonProps, PolymorphicComponentProps, Popover } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { FC, ReactNode } from "react";

type ConfirmButtonProps = PolymorphicComponentProps<"button", ButtonProps> & {
  actionDescription: ReactNode;
};

export const ConfirmButton: FC<ConfirmButtonProps> = (props) => {
  const { onClick, actionDescription, ...rest } = props;
  const handleClick: ConfirmButtonProps["onClick"] = (e) => {
    onClick?.(e);
  };

  const [opened, { open, close }] = useDisclosure(false);

  return (
    <Popover withOverlay overlayProps={{ backgroundOpacity: 0.1 }} opened={opened} onDismiss={close}>
      <Popover.Target>
        <Button {...rest} onClick={open} />
      </Popover.Target>
      <Popover.Dropdown>
        <div className="flex flex-col items-start gap-2">
          {actionDescription}
          <div className="flex flex-row gap-2">
            <Button size="xs" variant="subtle" onClick={close}>
              <Trans>Cancel</Trans>
            </Button>
            <Button {...rest} variant="outline" size="xs" onClick={handleClick} />
          </div>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
};
