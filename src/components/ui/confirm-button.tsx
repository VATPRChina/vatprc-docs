import { Trans } from "@lingui/react/macro";
import { Button, ButtonProps, PolymorphicComponentProps, Popover } from "@mantine/core";
import { FC, ReactNode } from "react";

type ConfirmButtonProps = PolymorphicComponentProps<"button", ButtonProps> & {
  actionDescription: ReactNode;
};

export const ConfirmButton: FC<ConfirmButtonProps> = (props) => {
  const { onClick, actionDescription, ...rest } = props;
  const handleClick: ConfirmButtonProps["onClick"] = (e) => {
    onClick?.(e);
  };

  return (
    <Popover withOverlay overlayProps={{ backgroundOpacity: 0.1 }}>
      <Popover.Target>
        <Button {...rest} />
      </Popover.Target>
      <Popover.Dropdown>
        <div className="flex flex-col items-start gap-2">
          {actionDescription}
          <div className="flex flex-row gap-2">
            <Button size="xs" variant="subtle" onClick={() => {}}>
              <Trans>Cancel</Trans>
            </Button>
            <Button {...rest} variant="outline" size="xs" onClick={handleClick} />
          </div>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
};
