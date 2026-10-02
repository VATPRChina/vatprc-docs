import { $api } from "@/lib/client";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Button, Modal } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

export function BatchDeleteModal({
  callsigns,
  onDeleted,
  onClose,
}: {
  callsigns: string[];
  onDeleted: (callsign: string) => void;
  onClose: () => void;
}) {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const [remaining, setRemaining] = useState(callsigns);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);
  const submitting = useRef(false);
  const remove = $api.useMutation("delete", "/api/atc/positions/{callsign}");
  const count = remaining.length;
  const deleteSelected = async () => {
    if (submitting.current || count === 0) return;
    submitting.current = true;
    setPending(true);
    const failures: Record<string, string> = {};
    for (const callsign of remaining) {
      try {
        await remove.mutateAsync({ params: { path: { callsign } } });
        onDeleted(callsign);
      } catch (error) {
        const problem = error as { detail?: string; message?: string } | null;
        failures[callsign] = problem?.detail ?? problem?.message ?? t`Failed to delete ATC position`;
      }
    }
    setRemaining(Object.keys(failures));
    setErrors(failures);
    try {
      await queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/positions"));
      if (Object.keys(failures).length === 0) onClose();
    } finally {
      submitting.current = false;
      setPending(false);
    }
  };
  return (
    <Modal
      opened
      title={t`Delete selected ATC positions`}
      onClose={() => !submitting.current && onClose()}
      withCloseButton={!pending}
    >
      <div className="flex flex-col gap-4">
        <p>
          <Trans>
            Are you sure you want to delete these {count} ATC positions? Successful deletions cannot be undone.
          </Trans>
        </p>
        <ul className="list-inside list-disc">
          {remaining.map((callsign) => (
            <li key={callsign}>
              <code>{callsign}</code>
              {errors[callsign] && <Alert color="red">{errors[callsign]}</Alert>}
            </li>
          ))}
        </ul>
        <div className="flex justify-end gap-2">
          <Button variant="default" disabled={pending} onClick={onClose}>
            <Trans>Cancel</Trans>
          </Button>
          <Button color="red" loading={pending} disabled={count === 0} onClick={() => void deleteSelected()}>
            <Trans>Delete {count} positions</Trans>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
