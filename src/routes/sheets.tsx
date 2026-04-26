import { RequireRole } from "@/components/require-role";
import { $api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { Trans } from "@lingui/react/macro";
import { Alert, Card, UnstyledButton } from "@mantine/core";
import { createFileRoute, Outlet, useNavigate, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/sheets")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { id } = useParams({ from: "/sheets/$id" });
  const { data: sheets, isLoading: isSheetsLoading } = $api.useQuery("get", "/api/sheets");
  console.log({ id, cur: sheets?.map((s) => s.id) });

  const totalSheets = sheets?.length ?? 0;

  return (
    <RequireRole role="staff">
      <div className="container mx-auto flex flex-col gap-4">
        <h1 className="text-3xl">
          <Trans>Sheet Management</Trans>
        </h1>
        <Alert color="blue">
          <Trans>Only staff can manage sheets. Changes are applied immediately after saving.</Trans>
        </Alert>
        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card withBorder className="flex flex-col gap-3">
            <h2 className="text-xl font-medium">
              <Trans>Sheets</Trans>
            </h2>
            <div className="flex max-h-128 flex-col gap-2 overflow-y-auto">
              {sheets?.map((currentSheet) => (
                <UnstyledButton
                  key={currentSheet.id}
                  className="rounded border px-3 py-2 text-left"
                  onClick={() =>
                    void navigate({
                      to: "/sheets/$id",
                      params: { id: currentSheet.id },
                    })
                  }
                >
                  <div className={cn("font-medium", currentSheet.id === id && "text-blue-900 dark:text-blue-100")}>
                    {currentSheet.name}
                  </div>
                  <div className="text-dimmed text-sm">{currentSheet.id}</div>
                </UnstyledButton>
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

          <Card withBorder className="flex flex-col gap-4">
            <Outlet />
          </Card>
        </div>
      </div>
    </RequireRole>
  );
}
