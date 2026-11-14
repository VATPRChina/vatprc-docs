import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

export type AtcPosition = components["schemas"]["AtcPositionDto"];

export const POSITION_CATEGORIES = [
  { value: "standard", label: msg`Standard` },
  { value: "chengdu-low-area", label: msg`Chengdu Low Area` },
  { value: "military", label: msg`Military` },
  { value: "atis", label: msg`ATIS` },
] satisfies { value: AtcPosition["category"]; label: ReturnType<typeof msg> }[];

export type PositionAction = { kind: "create" } | { kind: "edit" | "delete"; position: AtcPosition };

export function PositionModal({ action, onClose }: { action: PositionAction; onClose: () => void }) {
  const { t, i18n } = useLingui();
  const queryClient = useQueryClient();
  const position = action.kind === "create" ? undefined : action.position;
  const callsign = position?.callsign;
  const [value, setValue] = useState({
    category: position?.category ?? "standard",
    callsign: position?.callsign ?? "",
    is_tier_2: position?.is_tier_2 ?? false,
    callsign_zh: position?.callsign_zh ?? "",
    callsign_en: position?.callsign_en ?? "",
    frequency: position ? (position.frequency_khz / 1000).toFixed(3) : "",
    cpdlc_code: position?.cpdlc_code ?? "",
    remarks: position?.remarks ?? "",
  });
  const onSuccess = async () => {
    await queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/positions"));
    onClose();
  };
  const create = $api.useMutation("post", "/api/atc/positions", { onSuccess });
  const update = $api.useMutation("put", "/api/atc/positions/{callsign}", { onSuccess });
  const remove = $api.useMutation("delete", "/api/atc/positions/{callsign}", { onSuccess });
  const pending = create.isPending || update.isPending || remove.isPending;
  const error = create.error ?? update.error ?? remove.error;

  return (
    <Dialog
      open={true}
      onOpenChange={(open) => {
        if (!open) (() => !pending && onClose())();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {action.kind === "create"
              ? t`Create ATC Position`
              : action.kind === "edit"
                ? t`Edit ATC Position ${callsign}`
                : t`Delete ATC Position ${callsign}`}
          </DialogTitle>
        </DialogHeader>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (pending) return;
            if (action.kind === "delete") {
              remove.mutate({ params: { path: { callsign: action.position.callsign } } });
              return;
            }
            const body: components["schemas"]["AtcPositionSaveRequest"] = {
              ...value,
              callsign: value.callsign.trim().toUpperCase(),
              frequency: Number(value.frequency),
              callsign_zh: value.callsign_zh.trim() || null,
              callsign_en: value.callsign_en.trim() || null,
              cpdlc_code: value.cpdlc_code.trim() || null,
              remarks: value.remarks.trim() || null,
            };
            if (action.kind === "edit") {
              update.mutate({ params: { path: { callsign: action.position.callsign } }, body });
            } else {
              create.mutate({ body });
            }
          }}
        >
          {error && (
            <Alert variant={"destructive"}>
              <AlertTitle>{error.title}</AlertTitle>
              <AlertDescription>{error.detail}</AlertDescription>
            </Alert>
          )}
          {action.kind === "delete" ? (
            <p>
              <Trans>Are you sure to delete this ATC position?</Trans>
              <code>{callsign}</code>
            </p>
          ) : (
            <fieldset disabled={pending} className="flex flex-col gap-4">
              <label className="grid gap-1.5 text-sm">
                <span className="font-heading">{t`Callsign`}</span>
                <Input
                  aria-label={t`Callsign`}
                  required
                  maxLength={32}
                  pattern="[A-Za-z0-9_*]+"
                  disabled={action.kind === "edit"}
                  value={value.callsign}
                  onChange={(e) => setValue({ ...value, callsign: e.currentTarget.value.toUpperCase() })}
                />
                <span className="text-foreground/70 text-xs">
                  {action.kind === "edit"
                    ? t`The callsign cannot be changed after creation.`
                    : t`Use up to 32 letters, digits, underscores or asterisks.`}
                </span>
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-heading">{t`Category`}</span>
                <NativeSelect
                  aria-label={t`Category`}
                  required
                  value={value.category ?? ""}
                  onChange={(event) => {
                    const category = event.currentTarget.value || null;
                    const selected = POSITION_CATEGORIES.find((item) => item.value === category);
                    if (selected) setValue({ ...value, category: selected.value });
                  }}
                >
                  <NativeSelectOption value=""></NativeSelectOption>
                  {(POSITION_CATEGORIES.map((category) => ({ ...category, label: i18n._(category.label) })) ?? []).map(
                    (option) => {
                      const item = typeof option === "string" ? { value: option, label: option } : option;
                      return (
                        <NativeSelectOption key={item.value} value={item.value}>
                          {item.label}
                        </NativeSelectOption>
                      );
                    },
                  )}
                </NativeSelect>
              </label>
              <Label className="flex items-center gap-2">
                <Checkbox
                  checked={value.is_tier_2}
                  onCheckedChange={(nextChecked) => {
                    const e = nextChecked;
                    return setValue({ ...value, is_tier_2: e });
                  }}
                />
                <span>{t`Tier 2`}</span>
              </Label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-heading">{t`Frequency (MHz)`}</span>
                <Input
                  aria-label={t`Frequency (MHz)`}
                  type="number"
                  required
                  min={118}
                  max={136.975}
                  step={0.005}
                  value={value.frequency}
                  onChange={(e) => setValue({ ...value, frequency: e.currentTarget.value })}
                />
                <span className="text-foreground/70 text-xs">{t`118.000–136.975 MHz, in steps of 0.005 MHz.`}</span>
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-heading">{t`Chinese Callsign`}</span>
                <Input
                  aria-label={t`Chinese Callsign`}
                  value={value.callsign_zh}
                  onChange={(e) => setValue({ ...value, callsign_zh: e.currentTarget.value })}
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-heading">{t`English Callsign`}</span>
                <Input
                  aria-label={t`English Callsign`}
                  value={value.callsign_en}
                  onChange={(e) => setValue({ ...value, callsign_en: e.currentTarget.value })}
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-heading">{"CPDLC"}</span>
                <Input
                  aria-label={"CPDLC"}
                  value={value.cpdlc_code}
                  onChange={(e) => setValue({ ...value, cpdlc_code: e.currentTarget.value })}
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-heading">{t`Remarks`}</span>
                <Textarea
                  aria-label={t`Remarks`}
                  value={value.remarks}
                  onChange={(e) => setValue({ ...value, remarks: e.currentTarget.value })}
                />
              </label>
            </fieldset>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="default" disabled={pending} onClick={onClose}>
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit" disabled={pending} aria-busy={pending}>
              {action.kind === "delete" ? <Trans>Delete</Trans> : <Trans>Save</Trans>}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
