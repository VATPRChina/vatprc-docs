import { RequireRole } from "@/components/require-role";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Alert, Card, NavLink } from "@mantine/core";
import { createFileRoute, Link, Outlet, useParams } from "@tanstack/react-router";
import type { FC } from "react";

const RouteComponent: FC = () => {
  const id = useParams({ from: "/sheets/$id", shouldThrow: false, select: ({ id }) => id });
  const { data: sheets, error: sheetsError, isLoading: isSheetsLoading } = $api.useQuery("get", "/api/sheets");

  const totalSheets = sheets?.length ?? 0;

  return (
    <RequireRole role="staff">
      <div className="container mx-auto flex flex-col gap-4">
        <h1 className="text-3xl font-bold">
          <Trans>Sheet Management</Trans>
        </h1>
        <Alert color="blue">
          <Trans>Only staff can manage sheets. Changes are applied immediately after saving.</Trans>
        </Alert>
        {sheetsError && (
          <Alert color="red" title={sheetsError.title}>
            {sheetsError.detail}
          </Alert>
        )}
        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card withBorder className="flex flex-col gap-1">
            <h2 className="text-2xl font-bold">
              <Trans>Sheets</Trans>
            </h2>
            <div className="flex max-h-128 flex-col gap-1 overflow-y-auto">
              {sheets?.map((currentSheet) => (
                <NavLink
                  key={currentSheet.id}
                  renderRoot={(props) => <Link {...props} to="/sheets/$id" params={{ id: currentSheet.id }} />}
                  active={currentSheet.id === id}
                  label={currentSheet.name}
                  description={currentSheet.id}
                />
              ))}
              {!isSheetsLoading && !sheets?.length && (
                <Alert>
                  <Trans>No sheet available.</Trans>
                </Alert>
              )}
            </div>
            <div className="text-dimmed text-sm">
              <Trans>Total sheets: {totalSheets}</Trans>
            </div>
          </Card>

          <Card withBorder className="flex flex-col gap-1">
            <Outlet />
          </Card>
        </div>
      </div>
    </RequireRole>
  );
};

export const Route = createFileRoute("/sheets")({
  component: RouteComponent,
});
