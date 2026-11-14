import { POSITION_CATEGORIES } from "./position-modal";
import { AlertDescription, Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { TableHead, TableRow, TableHeader, TableCell, TableBody, Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans, useLingui } from "@lingui/react/macro";
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
    cpdlc_code: "CPDLC",
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
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) (() => !submitting.current && onClose())();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{t`Batch Create ATC Positions`}</DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            void savePositions();
          }}
        >
          <Alert>
            <AlertDescription>
              <Trans>
                Each position is saved separately. Successfully created positions remain saved if another position
                fails.
              </Trans>
            </AlertDescription>
          </Alert>
          <fieldset disabled={pending}>
            <div className={"overflow-x-auto"}>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Trans>ATC Position</Trans>
                    </TableHead>
                    <TableHead>
                      <Trans>Category</Trans>
                    </TableHead>
                    <TableHead>
                      <Trans>Tier 2</Trans>
                    </TableHead>
                    <TableHead>
                      <Trans>Frequency (MHz)</Trans>
                    </TableHead>
                    {optionalFields.map((key) => (
                      <TableHead key={key}>{labels[key]}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, index) => {
                    const callsign = row.callsign;
                    const rowNumber = index + 1;
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            aria-label={t`Callsign row ${rowNumber}`}
                            required
                            maxLength={32}
                            pattern="[A-Za-z0-9_*]+"
                            value={row.callsign}
                            onChange={(event) => edit(index, { callsign: event.currentTarget.value.toUpperCase() })}
                          />
                          {errors[index] && (
                            <Alert variant={"destructive"}>
                              <AlertDescription>{errors[index]}</AlertDescription>
                            </Alert>
                          )}
                          <Button
                            onClick={() => {
                              setRows((current) => current.filter((_, rowIndex) => rowIndex !== index));
                              setErrors({});
                            }}
                            variant={"neutral"}
                            size={"sm"}
                          >
                            <Trans>Remove row</Trans>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <NativeSelect
                            aria-label={t`Category ${callsign}`}
                            required
                            disabled={pending}
                            value={row.category ?? ""}
                            onChange={(event) => {
                              const value = event.currentTarget.value || null;
                              const category = POSITION_CATEGORIES.find((item) => item.value === value);
                              if (category) edit(index, { category: category.value });
                            }}
                          >
                            <NativeSelectOption value=""></NativeSelectOption>
                            {(
                              POSITION_CATEGORIES.map((category) => ({ ...category, label: i18n._(category.label) })) ??
                              []
                            ).map((option) => {
                              const item = typeof option === "string" ? { value: option, label: option } : option;
                              return (
                                <NativeSelectOption key={item.value} value={item.value}>
                                  {item.label}
                                </NativeSelectOption>
                              );
                            })}
                          </NativeSelect>
                        </TableCell>
                        <TableCell>
                          <Checkbox
                            aria-label={t`Tier 2 ${callsign}`}
                            checked={row.is_tier_2}
                            onCheckedChange={(nextChecked) => {
                              const event = nextChecked;
                              return edit(index, { is_tier_2: event });
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
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
                        </TableCell>
                        {optionalFields.map((key) => {
                          const FieldInput = key === "remarks" ? Textarea : Input;
                          return (
                            <TableCell key={key}>
                              <FieldInput
                                aria-label={`${labels[key]} ${callsign}`}
                                value={row[key] ?? ""}
                                onChange={(event) => edit(index, { [key]: event.currentTarget.value })}
                              />
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
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
            <Button type="submit" disabled={rows.length === 0 || pending} aria-busy={pending}>
              <Trans>Save {count} positions</Trans>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
