import { RequireRole } from "../require-role";
import { client } from "@/lib/client/client";
import { wrapPromiseWithToast } from "@/lib/utils";
import { ActionIcon } from "@mantine/core";
import { TbFileExport } from "react-icons/tb";

export const ExportSlot = ({ eventId }: { eventId: string }) => {
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
      <ActionIcon variant="subtle" aria-label="Export slots" onClick={wrapPromiseWithToast(onClick)}>
        <TbFileExport />
      </ActionIcon>
    </RequireRole>
  );
};
