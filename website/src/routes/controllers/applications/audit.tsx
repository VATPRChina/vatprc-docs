import { AuditLogTable } from "@/components/audit-log/audit-log-table";
import { BackButton } from "@/components/back-button";
import { RequireRole } from "@/components/require-role";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers/applications/audit")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireRole role="volunteer">
      <AtcApplicationAuditLogPage />
    </RequireRole>
  );
}

const AtcApplicationAuditLogPage = () => {
  const { data, error, isLoading } = $api.useQuery("get", "/api/atc/applications/audit");

  return (
    <div className="flex flex-col gap-4">
      <BackButton />
      <h2 className="text-2xl font-medium">
        <Trans>ATC Application Audit Logs</Trans>
      </h2>
      <AuditLogTable data={data} error={error} isLoading={isLoading} />
    </div>
  );
};
