import { Segments } from "./segment";
import { ValidationTag } from "@/components/flight-validations";
import type { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Divider, Skeleton } from "@mantine/core";
import type { FC } from "react";

type FlightAnalysis = components["schemas"]["FlightV2Dto"];
type Validation = components["schemas"]["ValidatorResult"];

export const FlightV2: FC<{ callsign: string }> = ({ callsign }) => {
  const { t } = useLingui();
  const query = $api.useQuery(
    "get",
    "/api/flights/by-callsign/{callsign}/v2",
    { params: { path: { callsign } } },
    { retry: false },
  );
  return (
    <div className="flex w-full flex-col gap-4">
      <Divider />
      {query.isLoading && <Skeleton h={384} aria-label={t`Loading flight analysis`} />}
      {query.error && (
        <Alert color="red" title={query.error.title ?? t`Unable to load flight analysis`}>
          {query.error.detail}
        </Alert>
      )}
      {!query.error && query.data && <FlightV2Result data={query.data} />}
    </div>
  );
};

export function FlightV2Result({ data }: { data: FlightAnalysis }) {
  const { t } = useLingui();

  return (
    <section aria-label={t`Flight analysis v2`} className="flex w-full min-w-0 flex-col gap-6">
      {data.errors.length > 0 && (
        <Alert color="yellow">
          <Trans>Analysis is incomplete. Only validators with the required inputs are shown.</Trans>
        </Alert>
      )}
      {data.errors.map((error, index) => (
        <Alert key={index} color="red" title={error.stage}>
          {error.message}
        </Alert>
      ))}
      <section aria-label={t`Route segments`} className="flex min-w-0 flex-col gap-4">
        <h2 className="text-2xl">
          <Trans>Route segments</Trans>
        </h2>
        <Segments data={data} />
      </section>
    </section>
  );
}

export function InlineValidations({ results }: { results: Validation[] }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1">
      {results.map((result) => (
        <ValidationTag key={`${result.validator_ident}:${JSON.stringify(result.scope)}`} result={result} compact />
      ))}
    </span>
  );
}
