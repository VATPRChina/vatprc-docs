import { AtcApplicationForm } from "@/components/atc-application/atc-application-form";
import {
  AtcApplicationStatusAlert,
  AtcApplicationStatusEdit,
} from "@/components/atc-application/atc-application-status";
import { AtcPermissionModalButton } from "@/components/atc-permission-modal";
import { AuditLogTable } from "@/components/audit-log/audit-log-table";
import { BackButton } from "@/components/back-button";
import { RequireRole } from "@/components/require-role";
import { $api } from "@/lib/client";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Button, Skeleton, Tooltip } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { TbSchool } from "react-icons/tb";

export const Route = createFileRoute("/controllers/applications/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { params } = Route.useMatch();

  const { data, error, isLoading } = $api.useQuery("get", "/api/atc/applications/{id}", {
    params: { path: { id: params.id } },
  });

  return (
    <div className="flex flex-col gap-4">
      <BackButton />
      {error && (
        <Alert color="red" title={error.title}>
          {error.detail}
        </Alert>
      )}
      <h2 className="text-2xl font-medium">
        <Trans>ATC Application</Trans>
      </h2>
      <AtcApplicationStatusAlert applicationId={params.id} />
      <AtcApplicationForm applicationId={params.id} />
      <h2 className="text-lg">
        <Trans>Review</Trans>
      </h2>
      <AtcApplicationStatusEdit applicationId={params.id} />
      <h2 className="text-lg">
        <Trans>User</Trans>
      </h2>
      <div className="flex flex-row gap-1">
        {isLoading ? (
          <Skeleton h={24} w={144} />
        ) : data?.user_id ? (
          <>
            <AtcPermissionModalButton userId={data.user_id} />
            <MoodleAccountProvisionButton
              applicationId={params.id}
              userId={data.user_id}
              hasMoodleAccount={!!data.user.moodle_account}
            />
          </>
        ) : null}
      </div>
      <RequireRole role="volunteer">
        <h2 className="text-lg">
          <Trans>Audit Logs</Trans>
        </h2>
        <AtcApplicationAuditLogPanel applicationId={params.id} />
      </RequireRole>
    </div>
  );
}

const MoodleAccountProvisionButton = ({
  applicationId,
  userId,
  hasMoodleAccount,
}: {
  applicationId: string;
  userId: string;
  hasMoodleAccount: boolean;
}) => {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const { mutate, error, isPending, isSuccess } = $api.useMutation("put", "/api/users/{id}/moodle-account", {
    onSuccess: async () => {
      await queryClient.invalidateQueries(
        $api.queryOptions("get", "/api/atc/applications/{id}", { params: { path: { id: applicationId } } }),
      );
      await queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/applications"));
    },
  });

  return (
    <RequireRole role="tech-director">
      <div className="flex flex-col gap-1">
        {isSuccess && (
          <Alert color="green">
            <Trans>The Moodle account has been provisioned successfully.</Trans>
          </Alert>
        )}
        {error && (
          <Alert color="red" title={error.title}>
            {error.detail}
          </Alert>
        )}
        <Tooltip label={t`Moodle account already exists`} disabled={!hasMoodleAccount}>
          <span>
            <Button
              size="xs"
              onClick={() => mutate({ params: { path: { id: userId } } })}
              leftSection={<TbSchool />}
              variant="subtle"
              loading={isPending}
              disabled={hasMoodleAccount}
            >
              <Trans>Provision Moodle</Trans>
            </Button>
          </span>
        </Tooltip>
      </div>
    </RequireRole>
  );
};

const AtcApplicationAuditLogPanel = ({ applicationId }: { applicationId: string }) => {
  const { data, error, isLoading } = $api.useQuery("get", "/api/atc/applications/{id}/audit", {
    params: { path: { id: applicationId } },
  });

  return <AuditLogTable data={data} error={error} isLoading={isLoading} />;
};
