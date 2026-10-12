import { POSITION_CATEGORIES } from "./position-modal";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Button, Checkbox, Modal, Select, Table, Textarea, TextInput } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

type PositionSave = components["schemas"]["AtcPositionSaveRequest"];
const optionalFields = ["callsign_zh", "callsign_en", "cpdlc_code", "remarks"] as const;
const emptyPosition = (): PositionSave => ({
  callsign: "",
  category: "standard",
  is_tier_2: false,
  frequency: NaN,
  callsign_zh: null,
  callsign_en: null,
  cpdlc_code: null,
  remarks: null,
});

export function BatchCreateModal({ onClose }: { onClose: () => void }) {
  const { t, i18n } = useLingui();
  const queryClient = useQueryClient();
  const [rows, setRows] = useState(() => [emptyPosition()]);
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  const add = $api.useMutation("post", "/api/atc/positions");
  const labels = {
    callsign_zh: t`Chinese Callsign`,
    callsign_en: t`English Callsign`,
    cpdlc_code: "CPDLC (S0780+)",
    remarks: t`Remarks`,
  };
  const edit = (index: number, patch: Partial<PositionSave>) => {
    setRows((current) => current.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  };

  const savePositions = async () => {
    if (submitting.current || rows.length === 0) return;
    {
      const duplicates: Record<number, string> = {};
      rows.forEach((row, index) => {
        if (rows.some((other, otherIndex) => otherIndex !== index && other.callsign.trim() === row.callsign.trim()))
          duplicates[index] = t`Duplicate callsign`;
      });
      if (Object.keys(duplicates).length) {
        setErrors(duplicates);
        return;
      }
    }
    submitting.current = true;
    setPending(true);
    const failures: Record<number, string> = {};
    const succeeded = new Set<number>();
    for (const [index, row] of rows.entries()) {
      const body = { ...row, callsign: row.callsign.trim().toUpperCase() };
      for (const key of optionalFields) body[key] = body[key]?.trim() || null;
      try {
        await add.mutateAsync({ body });
        succeeded.add(index);
      } catch (error) {
        const problem = error as { detail?: string; message?: string } | null;
        failures[index] = problem?.detail ?? problem?.message ?? t`Failed to save ATC position`;
      }
    }
    const remaining = rows.map((row, index) => ({ row, index })).filter(({ index }) => !succeeded.has(index));
    setRows(remaining.map(({ row }) => row));
    setErrors(Object.fromEntries(remaining.map(({ index }, newIndex) => [newIndex, failures[index]])));
    try {
      await queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/positions"));
      if (Object.keys(failures).length === 0) onClose();
    } finally {
      submitting.current = false;
      setPending(false);
    }
  };
  const count = rows.length;

  return (
    <Modal
      opened
      size="100%"
      title={t`Batch Create ATC Positions`}
      onClose={() => !submitting.current && onClose()}
      withCloseButton={!pending}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          void savePositions();
        }}
      >
        <Alert color="blue">
          <Trans>
            Each position is saved separately. Successfully created positions remain saved if another position fails.
          </Trans>
        </Alert>
        <fieldset disabled={pending}>
          <Table.ScrollContainer minWidth={1200}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <Trans>ATC Position</Trans>
                  </Table.Th>
                  <Table.Th>
                    <Trans>Category</Trans>
                  </Table.Th>
                  <Table.Th>
                    <Trans>Tier 2</Trans>
                  </Table.Th>
                  <Table.Th>
                    <Trans>Frequency (MHz)</Trans>
                  </Table.Th>
                  {optionalFields.map((key) => (
                    <Table.Th key={key}>{labels[key]}</Table.Th>
                  ))}
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((row, index) => {
                  const callsign = row.callsign;
                  const rowNumber = index + 1;
                  return (
                    <Table.Tr key={index}>
                      <Table.Td>
                        <TextInput
                          aria-label={t`Callsign row ${rowNumber}`}
                          required
                          maxLength={32}
                          pattern="[A-Za-z0-9_*]+"
                          value={row.callsign}
                          onChange={(event) => edit(index, { callsign: event.currentTarget.value.toUpperCase() })}
                        />
                        {errors[index] && (
                          <Alert color="red" mt="xs">
                            {errors[index]}
                          </Alert>
                        )}
                        <Button
                          variant="subtle"
                          color="red"
                          size="compact-sm"
                          onClick={() => {
                            setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
                            setErrors({});
                          }}
                        >
                          <Trans>Remove row</Trans>
                        </Button>
                      </Table.Td>
                      <Table.Td>
                        <Select
                          aria-label={t`Category ${callsign}`}
                          required
                          allowDeselect={false}
                          disabled={pending}
                          data={POSITION_CATEGORIES.map((category) => ({ ...category, label: i18n._(category.label) }))}
                          value={row.category}
                          onChange={(value) => {
                            const category = POSITION_CATEGORIES.find((item) => item.value === value);
                            if (category) edit(index, { category: category.value });
                          }}
                        />
                      </Table.Td>
                      <Table.Td>
                        <Checkbox
                          aria-label={t`Tier 2 ${callsign}`}
                          checked={row.is_tier_2}
                          onChange={(event) => edit(index, { is_tier_2: event.currentTarget.checked })}
                        />
                      </Table.Td>
                      <Table.Td>
                        <TextInput
                          aria-label={t`Frequency (MHz) ${callsign}`}
                          type="number"
                          required
                          min={118}
                          max={136.975}
                          step={0.005}
                          value={Number.isNaN(row.frequency) ? "" : row.frequency}
                          onChange={(event) =>
                            edit(index, {
                              frequency: event.currentTarget.value === "" ? NaN : Number(event.currentTarget.value),
                            })
                          }
                        />
                      </Table.Td>
                      {optionalFields.map((key) => {
                        const Input = key === "remarks" ? Textarea : TextInput;
                        return (
                          <Table.Td key={key}>
                            <Input
                              aria-label={`${labels[key]} ${callsign}`}
                              value={row[key] ?? ""}
                              onChange={(event) => edit(index, { [key]: event.currentTarget.value })}
                            />
                          </Table.Td>
                        );
                      })}
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </fieldset>
        <div className="flex justify-end gap-2">
          <Button
            variant="default"
            disabled={pending}
            onClick={() => setRows((current) => [...current, emptyPosition()])}
          >
            <Trans>Add position</Trans>
          </Button>
          <Button variant="default" disabled={pending} onClick={onClose}>
            <Trans>Cancel</Trans>
          </Button>
          <Button type="submit" loading={pending} disabled={rows.length === 0}>
            <Trans>Save {count} positions</Trans>
          </Button>
        </div>
      </form>
    </Modal>
  );
}
