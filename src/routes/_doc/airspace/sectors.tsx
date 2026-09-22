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
    <main className="container mx-auto flex flex-col gap-4">
      {isLoading && <Skeleton height={480} />}
      {error && (
        <Alert color="red" title={<Trans>Failed to load sector data.</Trans>}>
          {error.message}
        </Alert>
      )}
      {data && <SectorMap sectorData={data} />}
      <section>
        <p>
          <Trans>
            This map is intended for flight simulation use only. The boundaries shown on the map represent FIR
            boundaries within the simulation environment only and bear no relation to any real-world FIR boundaries or
            geopolitical borders. They do not represent the views or positions of any country, region, or international
            organization regarding geopolitical boundaries.
          </Trans>
        </p>
        <p>
          <Trans>
            For technical limitations, the boundaries shown on the map may be outdated or simplified. Please adhere to
            local controllers&apos; instructions when flying.
          </Trans>
        </p>
      </section>
    </main>
  );
}
