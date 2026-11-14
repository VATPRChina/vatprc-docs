import { RequireRole } from "@/components/require-role";
import { AlertDescription, Alert, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { $api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { Trans } from "@lingui/react/macro";
import { createFileRoute, Outlet, useNavigate, useParams } from "@tanstack/react-router";

export const Route = createFileRoute("/sheets")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const id = useParams({ from: "/sheets/$id", shouldThrow: false, select: ({ id }) => id });
  const { data: sheets, error: sheetsError, isLoading: isSheetsLoading } = $api.useQuery("get", "/api/sheets");

  const totalSheets = sheets?.length ?? 0;

  return (
    <RequireRole role="staff">
      <div className="container mx-auto flex flex-col gap-4">
        <h1 className="text-3xl">
          <Trans>Sheet Management</Trans>
        </h1>
        <Alert>
          <AlertDescription>
            <Trans>Only staff can manage sheets. Changes are applied immediately after saving.</Trans>
          </AlertDescription>
        </Alert>
        {sheetsError && (
          <Alert variant={"destructive"}>
            <AlertTitle>{sheetsError.title}</AlertTitle>
            <AlertDescription>{sheetsError.detail}</AlertDescription>
          </Alert>
        )}
        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="flex flex-col gap-1">
            <CardContent>
              <h2 className="text-xl font-medium">
                <Trans>Sheets</Trans>
              </h2>
              <div className="flex max-h-128 flex-col gap-1 overflow-y-auto">
                {sheets?.map((currentSheet) => (
                  <button
                    key={currentSheet.id}
                    className="rounded border px-3 py-2 text-left"
                    onClick={() =>
                      void navigate({
                        to: "/sheets/$id",
                        params: { id: currentSheet.id },
                      })
                    }
                    type={"button"}
                  >
                    <div className={cn("font-medium", currentSheet.id === id && "text-blue-900 dark:text-blue-100")}>
                      {currentSheet.name}
                    </div>
                    <div className="text-dimmed text-sm">{currentSheet.id}</div>
                  </button>
                ))}
                {!isSheetsLoading && !sheets?.length && (
                  <Alert>
                    <AlertDescription>
                      <Trans>No sheet available.</Trans>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
              <div className="text-dimmed text-sm">
                <Trans>Total sheets: {totalSheets}</Trans>
              </div>
            </CardContent>
          </Card>
          <Card className="flex flex-col gap-1">
            <CardContent>
              <Outlet />
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireRole>
  );
}
