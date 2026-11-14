import { DateTime } from "./datetime";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table";
import { useUser } from "@/lib/client";
import { $api, client } from "@/lib/client/client";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parse } from "date-fns";
import { unique } from "radash";
import { useState as useDisclosureState } from "react";
import { useState } from "react";
import { TbFileImport } from "react-icons/tb";

interface Slot {
  airspace: string;
  icao_codes: string[];
  enter_at: Date;
  leave_at?: Date;
  callsign?: string;
  aircraft_type_icao?: string;
}

export const ImportSlot = ({ eventId }: { eventId: string }) => {
  const { t } = useLingui();
  const [opened, setOpened] = useDisclosureState(false);
  const toggle = () => setOpened((value) => !value);
  const close = () => setOpened(false);

  const user = useUser();
  const queryClient = useQueryClient();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [fileError, setFileError] = useState<Error | null>(null);

  const onDrop = async (files: File[]) => {
    try {
      setFileError(null);
      const file = files[0];
      const data = (await file?.text()) ?? "";
      setSlots(
        data
          .split("\n")
          .map((line) => {
            const [dep, dep_time, arr, arr_time, callsign, aircraft_type_icao] = line.split(",");
            if (!dep || !dep_time || !arr) return;
            return {
              airspace: `${dep} - ${arr}`,
              icao_codes: [dep, arr],
              enter_at: parse(dep_time ?? "", "yyyy-MM-dd HH:mm", Date.now(), { in: utc }),
              leave_at: arr_time ? parse(arr_time, "yyyy-MM-dd HH:mm", Date.now(), { in: utc }) : undefined,
              callsign: callsign,
              aircraft_type_icao: aircraft_type_icao,
            };
          })
          .filter((x) => !!x),
      );
    } catch (caught) {
      setFileError(caught instanceof Error ? caught : new Error(t`Failed to read the CSV file.`));
    }
  };

  const { error, isPending, mutate } = useMutation({
    mutationKey: $api.queryOptions("get", "/api/events/{event_id}/slots", { params: { path: { event_id: eventId } } })
      .queryKey,
    mutationFn: async () => {
      const airspaces = await Promise.all(
        unique(slots, (s) => s.airspace).map((slot) =>
          client.POST("/api/events/{event_id}/airspaces", {
            params: { path: { event_id: eventId } },
            body: { name: slot.airspace, icao_codes: slot.icao_codes, description: "" },
          }),
        ),
      );
      const airspaceError = airspaces.find((response) => response.error)?.error;
      if (airspaceError) {
        throw new Error(airspaceError.detail || airspaceError.title || t`Failed to import slots.`);
      }

      const slotResponses = await Promise.all(
        slots.map((slot) =>
          client.POST("/api/events/{event_id}/slots", {
            params: { path: { event_id: eventId } },
            body: {
              airspace_id: airspaces.find((a) => a.data?.name === slot.airspace)?.data?.id ?? "",
              enter_at: slot.enter_at.toISOString(),
              leave_at: slot.leave_at?.toISOString(),
              callsign: slot.callsign,
              aircraft_type_icao: slot.aircraft_type_icao,
            },
          }),
        ),
      );
      const slotError = slotResponses.find((response) => response.error)?.error;
      if (slotError) {
        throw new Error(slotError.detail || slotError.title || t`Failed to import slots.`);
      }
    },
    onSuccess: () => {
      close();
      return queryClient.invalidateQueries(
        $api.queryOptions("get", "/api/events/{event_id}/slots", { params: { path: { event_id: eventId } } }),
      );
    },
  });
  const onSubmit = () => {
    mutate();
  };

  if (!user?.roles.includes("event-coordinator")) return null;
  return (
    <>
      <Button aria-label={t`Import Slots`} onClick={toggle} size={"icon-sm"} variant={"neutral"}>
        <TbFileImport size={18} />
      </Button>
      <Dialog
        open={opened}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{t`Import slots`}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {(fileError ?? error) && (
              <Alert variant={"destructive"}>
                <AlertTitle>{<Trans>Failed to import slots.</Trans>}</AlertTitle>
                <AlertDescription>{(fileError ?? error)?.message}</AlertDescription>
              </Alert>
            )}
            <p>
              <Trans>
                File format: CSV with dep, dep_time (yyyy-MM-dd HH:mm), arr, arr_time (yyyy-MM-dd HH:mm), callsign,
                aircraft_type_icao
              </Trans>
            </p>
            <label className="border-border grid gap-2 border-2 border-dashed p-4">
              <span>
                <Trans>Choose a CSV file to import slots</Trans>
              </span>
              <Input
                type="file"
                accept=".csv,text/csv"
                onChange={(event) => void onDrop(Array.from(event.currentTarget.files ?? []))}
              />
            </label>
            <Button onClick={onSubmit} disabled={slots.length === 0 || isPending} aria-busy={isPending}>
              <Trans>Create Slots</Trans>
            </Button>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Trans>Area</Trans>
                  </TableHead>
                  <TableHead>
                    <Trans>Enter at</Trans>
                  </TableHead>
                  <TableHead>
                    <Trans>Callsign</Trans>
                  </TableHead>
                  <TableHead>
                    <Trans>Aircraft Type</Trans>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots?.map((slot, i) => (
                  <TableRow key={i}>
                    <TableCell>{slot.airspace}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <p>
                          <Badge className="mr-1">
                            <Trans>CTOT</Trans>
                          </Badge>
                          <DateTime noDate>{slot.enter_at}</DateTime>
                        </p>
                        <p>
                          <Badge className="mr-1">
                            <Trans>ELDT</Trans>
                          </Badge>
                          <DateTime noDate>{slot.leave_at}</DateTime>
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{slot.callsign}</TableCell>
                    <TableCell>{slot.aircraft_type_icao}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
