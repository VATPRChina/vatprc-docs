import { AuditLogTable } from "@/components/audit-log/audit-log-table";
import { BackButton } from "@/components/back-button";
import { RequireRole } from "@/components/require-role";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/users/audit")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <RequireRole role="volunteer">
      <UserAuditLogPage />
    </RequireRole>
  );
}

const UserAuditLogPage = () => {
  const { data, error, isLoading } = $api.useQuery("get", "/api/users/audit");

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <BackButton />
      <h1 className="text-2xl">
        <Trans>User Audit Logs</Trans>
      </h1>
      <AuditLogTable data={data} error={error} isLoading={isLoading} />
    </div>
  );
};
