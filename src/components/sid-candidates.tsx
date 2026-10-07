import type { components } from "@/lib/api";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Badge, Table } from "@mantine/core";

type SidCandidate = components["schemas"]["SidCandidate"];

export function SidCandidates({ candidates }: { candidates: SidCandidate[] }) {
  const { t } = useLingui();
  const runways = [...new Set(candidates.flatMap((candidate) => candidate.runway_transitions))].sort();

  return (
    <section aria-label={t`SID candidates by runway`} className="flex flex-col gap-2">
      <h4 className="text-lg">
        <Trans>SID candidates by runway</Trans>
      </h4>
      {runways.length ? (
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th scope="col">
                <Trans>Runway</Trans>
              </Table.Th>
              <Table.Th scope="col">
                <Trans>Available SIDs</Trans>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {runways.map((runway) => (
              <Table.Tr key={runway}>
                <Table.Th scope="row" className="w-24 align-top font-mono">
                  {runway === "ALL" ? <Trans>All runways</Trans> : runway}
                </Table.Th>
                <Table.Td>
                  <div className="flex flex-wrap gap-2">
                    {candidates
                      .filter((candidate) => candidate.runway_transitions.includes(runway))
                      .map((candidate) => (
                        <Badge key={candidate.identifier} color={candidate.is_rnav ? "blue" : "gray"} variant="light">
                          <span className="font-mono">{candidate.identifier}</span>
                          {" · "}
                          {candidate.is_rnav ? <Trans>RNAV</Trans> : <Trans>Conventional</Trans>}
                        </Badge>
                      ))}
                  </div>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      ) : (
        <Alert>
          <Trans>No SID candidates match this route.</Trans>
        </Alert>
      )}
    </section>
  );
}
