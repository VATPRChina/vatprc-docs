import { WARNING_MESSAGE_TO_POPOVER } from "./message";
import { WARNING_CODE_TO_MESSAGE } from "./message";
import { WARNING_MESSAGE_TO_SEVERITY } from "@/components/flight/message";
import { components } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Popover, Button, ActionIcon } from "@mantine/core";
import { FC } from "react";
import { TbInfoCircleFilled } from "react-icons/tb";

interface WarningProps {
  field: components["schemas"]["WarningMessageField"];
  field_index?: number;
  warnings?: components["schemas"]["WarningMessage"][];
  flight: components["schemas"]["FlightDto"];
  popoverText?: boolean;
}

export const Warning: FC<WarningProps & React.ComponentProps<typeof Popover>> = ({
  field,
  field_index,
  warnings,
  flight,
  popoverText,
  ...props
}) => {
  if (!warnings) return null;

  const localWarnings = warnings.filter((w) => w.field === field && w.field_index === (field_index ?? null));

  if (localWarnings.length === 0) return null;

  return (
    <div className="flex items-center gap-1">
      {localWarnings.map((warning) => {
        const message = WARNING_CODE_TO_MESSAGE[warning.message_code] ?? warning.message_code;
        const content = WARNING_MESSAGE_TO_POPOVER[warning.message_code]?.({ warning, flight }) as React.ReactNode;

        const button =
          !popoverText && message ? (
            <Button
              variant="outline"
              size="xs"
              className={cn(content && "underline", popoverText && "-ml-1")}
              key={warning.message_code}
              leftSection={<TbInfoCircleFilled />}
              color={((WARNING_MESSAGE_TO_SEVERITY[warning.message_code] ?? "error") === "error" && "red") || "gray"}
            >
              {!popoverText && message}
            </Button>
          ) : (
            <ActionIcon
              variant="outline"
              size="sm"
              key={warning.message_code}
              color={((WARNING_MESSAGE_TO_SEVERITY[warning.message_code] ?? "error") === "error" && "red") || "gray"}
            >
              <TbInfoCircleFilled />
            </ActionIcon>
          );

        if (!content && !popoverText) return button;

        return (
          <Popover {...props} key={warning.message_code}>
            <Popover.Target>{button}</Popover.Target>
            <Popover.Dropdown className="w-max">
              {popoverText && message}
              {content}
            </Popover.Dropdown>
          </Popover>
        );
      })}
    </div>
  );
};
