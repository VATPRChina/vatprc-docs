import type { components } from "@/lib/api";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Badge, Card } from "@mantine/core";

type SidCandidate = components["schemas"]["SidCandidate"];

const IS_PREFERRED_SID_PLACEHOLDER = false;

export function SidCandidates({ candidates }: { candidates: SidCandidate[] }) {
  const { t } = useLingui();
  const runways = [...new Set(candidates.flatMap((candidate) => candidate.runway_transitions))].sort();

  return (
    <section aria-label={t`SID candidates`} className="flex flex-col gap-2">
      <h4 className="text-lg font-bold">
        <Trans>SID candidates</Trans>
      </h4>
      {runways.length ? (
        <div className="flex flex-wrap gap-2">
          {runways.map((runway) => (
            <Card
              key={runway}
              role="group"
              aria-label={runway === "ALL" ? t`All runways` : t`Runway ${runway}`}
              withBorder
              className="p-4"
            >
              <b className="text-lg">{runway === "ALL" ? <Trans>All runways</Trans> : runway}</b>
              <div className="flex flex-col flex-wrap gap-1 pt-2">
                {candidates
                  .filter((candidate) => candidate.runway_transitions.includes(runway))
                  .map((candidate) => (
                    <div key={candidate.identifier} className="flex flex-wrap items-center gap-1">
                      <span className="font-mono">{candidate.identifier}</span>
                      {candidate.is_rnav ? (
                        <Badge color="blue" variant="outline" size="xs">
                          <Trans>RNAV</Trans>
                        </Badge>
                      ) : (
                        <Badge color="gray" variant="outline" size="xs">
                          <Trans>Conventional</Trans>
                        </Badge>
                      )}
                      {IS_PREFERRED_SID_PLACEHOLDER && (
                        <Badge color="green" variant="light" size="xs">
                          <Trans>Preferred</Trans>
                        </Badge>
                      )}
                    </div>
                  ))}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Alert>
          <Trans>No SID candidates match this route.</Trans>
        </Alert>
      )}
    </section>
  );
}
