import { RequireRole } from "../require-role";
import { client } from "@/lib/client/client";
import { wrapPromiseWithLog } from "@/lib/utils";
import { useLingui } from "@lingui/react/macro";
import { ActionIcon } from "@mantine/core";
import type { FC } from "react";
import { TbFileExport } from "react-icons/tb";

export const ExportSlot: FC<{ eventId: string }> = ({ eventId }) => {
  const { t } = useLingui();
  const onClick = async () => {
    const data = await client.GET("/api/events/{event_id}/slots/bookings.csv", {
      params: { path: { event_id: eventId } },
      parseAs: "blob",
    });
    if (!data?.data) return;
    const url = URL.createObjectURL(data?.data);
    const link = document.createElement("a");
    link.download = `slot_booking.csv`;
    link.href = url;
    link.click();
  };

  return (
    <RequireRole role="event-coordinator">
      <ActionIcon variant="subtle" aria-label={t`Export slots`} onClick={wrapPromiseWithLog(onClick)}>
        <TbFileExport />
      </ActionIcon>
    </RequireRole>
  );
};
