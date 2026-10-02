import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Button, Checkbox, Modal, Select, Textarea, TextInput } from "@mantine/core";
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
    <Modal
      opened
      onClose={() => !pending && onClose()}
      withCloseButton={!pending}
      size="lg"
      title={
        action.kind === "create"
          ? t`Create ATC Position`
          : action.kind === "edit"
            ? t`Edit ATC Position ${callsign}`
            : t`Delete ATC Position ${callsign}`
      }
    >
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
          <Alert color="red" title={error.title}>
            {error.detail}
          </Alert>
        )}
        {action.kind === "delete" ? (
          <p>
            <Trans>Are you sure to delete this ATC position?</Trans> <code>{callsign}</code>
          </p>
        ) : (
          <fieldset disabled={pending} className="flex flex-col gap-4">
            <TextInput
              label={t`Callsign`}
              required
              maxLength={32}
              pattern="[A-Za-z0-9_*]+"
              description={
                action.kind === "edit"
                  ? t`The callsign cannot be changed after creation.`
                  : t`Use up to 32 letters, digits, underscores or asterisks.`
              }
              disabled={action.kind === "edit"}
              value={value.callsign}
              onChange={(e) => setValue({ ...value, callsign: e.currentTarget.value.toUpperCase() })}
            />
            <Select
              label={t`Category`}
              required
              allowDeselect={false}
              data={POSITION_CATEGORIES.map((category) => ({ ...category, label: i18n._(category.label) }))}
              value={value.category}
              onChange={(category) => {
                const selected = POSITION_CATEGORIES.find((item) => item.value === category);
                if (selected) setValue({ ...value, category: selected.value });
              }}
            />
            <Checkbox
              label={t`Tier 2`}
              checked={value.is_tier_2}
              onChange={(e) => setValue({ ...value, is_tier_2: e.currentTarget.checked })}
            />
            <TextInput
              label={t`Frequency (MHz)`}
              description={t`118.000–136.975 MHz, in steps of 0.005 MHz.`}
              type="number"
              required
              min={118}
              max={136.975}
              step={0.005}
              value={value.frequency}
              onChange={(e) => setValue({ ...value, frequency: e.currentTarget.value })}
            />
            <TextInput
              label={t`Chinese Callsign`}
              value={value.callsign_zh}
              onChange={(e) => setValue({ ...value, callsign_zh: e.currentTarget.value })}
            />
            <TextInput
              label={t`English Callsign`}
              value={value.callsign_en}
              onChange={(e) => setValue({ ...value, callsign_en: e.currentTarget.value })}
            />
            <TextInput
              label="CPDLC (S0780+)"
              value={value.cpdlc_code}
              onChange={(e) => setValue({ ...value, cpdlc_code: e.currentTarget.value })}
            />
            <Textarea
              label={t`Remarks`}
              value={value.remarks}
              onChange={(e) => setValue({ ...value, remarks: e.currentTarget.value })}
            />
          </fieldset>
        )}
        <div className="flex justify-end gap-2">
          <Button variant="default" disabled={pending} onClick={onClose}>
            <Trans>Cancel</Trans>
          </Button>
          <Button type="submit" color={action.kind === "delete" ? "red" : undefined} loading={pending}>
            {action.kind === "delete" ? <Trans>Delete</Trans> : <Trans>Save</Trans>}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
