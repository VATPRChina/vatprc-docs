import { $api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { Box, Button, Collapse } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import React from "react";
import { TbCaretUpDown, TbLoader } from "react-icons/tb";

const Pilot: React.FC<{
  callsign: string;
  aircraft: string | null | undefined;
  departure: string | null | undefined;
  arrival: string | null | undefined;
}> = ({ callsign, aircraft, departure, arrival }) => {
  return (
    <div className="hover:bg-secondary flex flex-col rounded-md border px-6 py-4">
      <div className="flex gap-2">
        <span className="font-bold">{callsign}</span>
        <span className="font-light text-gray-500">{aircraft}</span>
      </div>
      <div className="flex gap-1">
        <span>{departure}</span>
        <span>-</span>
        <span>{arrival}</span>
      </div>
    </div>
  );
};

export const OnlinePilots: React.FC<{ className?: string }> = ({ className }) => {
  const { t } = useLingui();

  const { data, isLoading } = $api.useQuery("get", "/api/compat/online-status");

  const [opened, { toggle }] = useDisclosure(false);

  if (isLoading) {
    return <TbLoader className="m-auto h-24 animate-spin" size={48} />;
  }

  const pilots =
    data?.pilots?.map((c) => (
      <Pilot key={c.callsign} callsign={c.callsign} aircraft={c.aircraft} departure={c.departure} arrival={c.arrival} />
    )) ?? [];

  if (pilots.length <= 0) {
    return (
      (!data || data?.pilots?.length === 0) && (
        <div className={cn("flex flex-wrap justify-center gap-x-2 gap-y-4")}>
          {(!data || data?.pilots?.length === 0) && (
            <span>
              <Trans>No online pilot.</Trans>
            </span>
          )}
        </div>
      )
    );
  }

  return (
    <Box className="space-y-2">
      <div className={cn(className, "flex flex-wrap justify-center gap-x-2 gap-y-2")}>{pilots?.slice(0, 8)}</div>
      <Collapse in={opened}>
        <div className={cn(className, "mt-2 flex flex-wrap justify-center gap-x-2 gap-y-2")}>{pilots?.slice(8)}</div>
      </Collapse>
      <div className="mt-2 flex items-center justify-center space-x-4 px-4">
        <Button variant="subtle" size="sm" onClick={toggle}>
          {opened ? t`Show less pilots` : t`Show all pilots`}
          <TbCaretUpDown />
        </Button>
      </div>
    </Box>
  );
};
