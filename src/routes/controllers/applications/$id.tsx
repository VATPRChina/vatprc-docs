import { AtcApplicationForm } from "@/components/atc-application/atc-application-form";
import {
  AtcApplicationStatusAlert,
  AtcApplicationStatusEdit,
} from "@/components/atc-application/atc-application-status";
import { AtcPermissionModalButton } from "@/components/atc-permission-modal";
import { AuditLogTable } from "@/components/audit-log/audit-log-table";
import { BackButton } from "@/components/back-button";
import { RequireRole } from "@/components/require-role";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { $api } from "@/lib/client";
import { Trans, useLingui } from "@lingui/react/macro";
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
        <Alert variant={"destructive"}>
          <AlertTitle>{error.title}</AlertTitle>
          <AlertDescription>{error.detail}</AlertDescription>
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
          <Skeleton className="h-24" style={{ width: 144 }} />
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
          <Alert>
            <AlertDescription>
              <Trans>The Moodle account has been provisioned successfully.</Trans>
            </AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant={"destructive"}>
            <AlertTitle>{error.title}</AlertTitle>
            <AlertDescription>{error.detail}</AlertDescription>
          </Alert>
        )}
        {!hasMoodleAccount ? (
          <>
            <span>
              <Button
                size="xs"
                onClick={() => mutate({ params: { path: { id: userId } } })}
                disabled={hasMoodleAccount || isPending}
                aria-busy={isPending}
                variant={"neutral"}
              >
                {<TbSchool />}
                <Trans>Provision Moodle</Trans>
              </Button>
            </span>
          </>
        ) : (
          <Tooltip>
            <TooltipTrigger render={<span className="inline-flex" />}>
              <span>
                <Button
                  size="xs"
                  onClick={() => mutate({ params: { path: { id: userId } } })}
                  disabled={hasMoodleAccount || isPending}
                  aria-busy={isPending}
                  variant={"neutral"}
                >
                  {<TbSchool />}
                  <Trans>Provision Moodle</Trans>
                </Button>
              </span>
            </TooltipTrigger>
            <TooltipContent>{t`Moodle account already exists`}</TooltipContent>
          </Tooltip>
        )}
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
