import { DateTime } from "./datetime";
import { useUser } from "@/lib/client";
import { $api, client } from "@/lib/client/client";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Alert, Button, Modal, Pill, Table, Text, useMantineTheme } from "@mantine/core";
import { Dropzone, FileWithPath } from "@mantine/dropzone";
import { useDisclosure } from "@mantine/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { parse } from "date-fns";
import { unique } from "radash";
import { useState } from "react";
import { TbFileImport, TbUpload, TbX, TbFileTypeCsv } from "react-icons/tb";

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
  const [opened, { toggle, close }] = useDisclosure(false);
  const theme = useMantineTheme();
  const user = useUser();
  const queryClient = useQueryClient();

  const [slots, setSlots] = useState<Slot[]>([]);
  const [fileError, setFileError] = useState<Error | null>(null);

  const onDrop = async (files: FileWithPath[]) => {
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
      <ActionIcon variant="subtle" aria-label={t`Import Slots`} onClick={toggle}>
        <TbFileImport size={18} />
      </ActionIcon>
      <Modal opened={opened} onClose={close} title={t`Import slots`} size="xl">
        <div className="flex flex-col gap-4">
          {(fileError ?? error) && (
            <Alert color="red" title={<Trans>Failed to import slots.</Trans>}>
              {(fileError ?? error)?.message}
            </Alert>
          )}
          <Text>
            <Trans>
              File format: CSV with dep, dep_time (yyyy-MM-dd HH:mm), arr, arr_time (yyyy-MM-dd HH:mm), callsign,
              aircraft_type_icao
            </Trans>
          </Text>
          <Dropzone onDrop={(files) => void onDrop(files)}>
            <div className="pointer-events-none flex flex-wrap items-center justify-center gap-2">
              <Dropzone.Accept>
                <TbUpload color={theme.colors.green[7]} size={52} strokeWidth={1.5} />
              </Dropzone.Accept>
              <Dropzone.Reject>
                <TbX color={theme.colors.red[7]} size={52} strokeWidth={1.5} />
              </Dropzone.Reject>
              <Dropzone.Idle>
                <TbFileTypeCsv color={theme.colors.gray[7]} size={52} strokeWidth={1.5} />
              </Dropzone.Idle>

              <Text size="xl" inline>
                <Trans>Drag CSV here or click to select files</Trans>
              </Text>
            </div>
          </Dropzone>
          <Button onClick={onSubmit} disabled={slots.length === 0} loading={isPending}>
            <Trans>Create Slots</Trans>
          </Button>
          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>
                  <Trans>Area</Trans>
                </Table.Th>
                <Table.Th>
                  <Trans>Enter at</Trans>
                </Table.Th>
                <Table.Th>
                  <Trans>Callsign</Trans>
                </Table.Th>
                <Table.Th>
                  <Trans>Aircraft Type</Trans>
                </Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {slots?.map((slot, i) => (
                <Table.Tr key={i}>
                  <Table.Td>{slot.airspace}</Table.Td>
                  <Table.Td>
                    <div className="flex flex-col gap-1">
                      <Text>
                        <Pill className="mr-1">
                          <Trans>CTOT</Trans>
                        </Pill>
                        <DateTime noDate>{slot.enter_at}</DateTime>
                      </Text>
                      <Text>
                        <Pill className="mr-1">
                          <Trans>ELDT</Trans>
                        </Pill>
                        <DateTime noDate>{slot.leave_at}</DateTime>
                      </Text>
                    </div>
                  </Table.Td>
                  <Table.Td>{slot.callsign}</Table.Td>
                  <Table.Td>{slot.aircraft_type_icao}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </div>
      </Modal>
    </>
  );
};
