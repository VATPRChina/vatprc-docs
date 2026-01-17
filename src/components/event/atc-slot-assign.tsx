import { UserInput } from "../user-input";
import { $api } from "@/lib/client";
import { promiseWithToast, wrapPromiseWithLog } from "@/lib/utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { Button, Modal } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm, useStore } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { FormEvent } from "react";

export const AssignAtcSlot = ({ eventId, positionId }: { eventId: string; positionId: string }) => {
  const { t } = useLingui();
  const [opened, { toggle, close }] = useDisclosure(false);

  const queryClient = useQueryClient();
  const { data: slots, isLoading } = $api.useQuery("get", "/api/events/{eventId}/controllers", {
    params: { path: { eventId } },
  });
  const slot = slots?.find((s) => s.id === positionId);
  const callsign = slot?.callsign;

  const onSuccess = wrapPromiseWithLog(async () => {
    close();
    await queryClient.invalidateQueries({
      queryKey: $api.queryOptions("get", "/api/events/{eventId}/controllers", { params: { path: { eventId } } })
        .queryKey,
    });
  });
  const { mutate: assign, isPending: isAssignPending } = $api.useMutation(
    "put",
    "/api/events/{eventId}/controllers/{positionId}/booking",
    { onSuccess },
  );
  const { mutate: unassign, isPending: isUnassignPending } = $api.useMutation(
    "delete",
    "/api/events/{eventId}/controllers/{positionId}/booking",
    { onSuccess },
  );

  const form = useForm({
    defaultValues: {
      cid: slot?.booking?.user?.cid ?? "",
    },
    onSubmit: () => {
      if (!user?.id) return;
      assign({
        params: { path: { eventId, positionId } },
        body: { user_id: user?.id },
      });
    },
  });

  const cid = useStore(form.store, (state) => state.values.cid);
  const { data: user } = $api.useQuery(
    "get",
    "/api/users/by-cid/{cid}",
    { params: { path: { cid } } },
    { enabled: cid.length > 0 },
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    promiseWithToast(form.handleSubmit());
  };
  const onUnassign = () => {
    unassign({ params: { path: { eventId, positionId } } });
  };

  return (
    <>
      <Button variant="subtle" onClick={toggle} size="compact-sm">
        <Trans>Assign</Trans>
      </Button>
      <Modal opened={opened} onClose={close} size="xl" title={t`Assign ATC Position ${callsign}`}>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <form.Field name="cid">
            {(field) => (
              <UserInput
                label={<Trans>CID</Trans>}
                onChange={(v) => v && field.handleChange(v)}
                value={field.state.value}
                onBlur={field.handleBlur}
                disabled={isLoading}
                error={!user && cid.length > 0 && !isLoading ? t`No user found with this CID` : undefined}
                description={`${user?.full_name ?? user?.cid ?? ""}/${user?.id ?? ""}`}
              />
            )}
          </form.Field>
          <div className="flex flex-row gap-2">
            <Button variant="subtle" type="submit" loading={isAssignPending} disabled={!user || !!slot?.booking}>
              <Trans>Assign</Trans>
            </Button>
            <Button
              variant="subtle"
              type="button"
              loading={isUnassignPending}
              disabled={slot?.booking == null}
              onClick={onUnassign}
            >
              <Trans>Unassign</Trans>
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};
