import { SectorMap } from "@/components/airspace/sector-map";
import { fetchZbpeSectors } from "@/lib/sector-data";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Alert, Skeleton } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/airspace/sectors")({
  component: Page,
  head: (ctx) => ({ meta: [{ title: ctx.match.context.i18n._(msg`Sector Map`) }] }),
});

function Page() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["zbpe-sectors"],
    queryFn: fetchZbpeSectors,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <main className="container mx-auto">
      {isLoading && <Skeleton height={480} />}
      {error && (
        <Alert color="red" title={<Trans>Failed to load sector data.</Trans>}>
          {error.message}
        </Alert>
      )}
      {data && <SectorMap sectorData={data} />}
    </main>
  );
}
