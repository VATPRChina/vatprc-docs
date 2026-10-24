import { FixPair } from "./fix";
import { CRUISING_LEVEL_TEXT } from "./message";
import type { components } from "@/lib/api";
import { useLingui, Trans } from "@lingui/react/macro";
import { Card, Badge, Alert } from "@mantine/core";
import { FC } from "react";

const PreferredRoute: FC<{ candidate: components["schemas"]["PreferredRouteMatchCandidate"]; selected: boolean }> = ({
  candidate,
  selected,
}) => {
  const { t } = useLingui();

  return (
    <Card withBorder>
      <div className="flex flex-row items-center gap-2">
        <span className="font-semibold">{candidate.route.name}</span>
        <Badge
          color={selected ? "green" : candidate.error ? "red" : candidate.matched ? "teal" : "gray"}
          variant="light"
        >
          {selected
            ? t`Selected match`
            : candidate.error
              ? t`Invalid route`
              : candidate.matched
                ? t`Matched`
                : t`No match`}
        </Badge>
        <FixPair from={candidate.from.identifier} to={candidate.to.identifier} />
      </div>
      <div className="mt-3 flex flex-col gap-2 text-sm">
        <p className="font-mono wrap-break-word">{candidate.route.raw_route || "—"}</p>
        {candidate.error && <Alert color="red">{candidate.error}</Alert>}
        <p>
          <span>{CRUISING_LEVEL_TEXT[candidate.route.cruising_level_restriction.replaceAll("-", "_")]}</span>
          <span className="ml-2">
            <Trans>Minimum altitude</Trans>: {candidate.route.minimal_altitude} ft
          </span>
          {candidate.route.allowed_altitudes.length > 0 && (
            <span className="ml-2">
              <Trans>Allowed altitudes: </Trans>${candidate.route.allowed_altitudes.join(", ")} ft
            </span>
          )}
        </p>
        {candidate.route.remarks && <p>{candidate.route.remarks}</p>}
      </div>
    </Card>
  );
};

export const PreferredRoutes: FC<{ matches?: components["schemas"]["SegmentRouteMatches"] }> = ({ matches }) => {
  if (!matches)
    return (
      <p className="text-muted-foreground">
        <Trans>Preferred route matching is unavailable.</Trans>
      </p>
    );
  if (!matches.candidates.length)
    return (
      <p className="text-muted-foreground">
        <Trans>No preferred route candidates for this segment.</Trans>
      </p>
    );
  return (
    <div className="flex flex-col gap-2">
      {matches.candidates.map((candidate, index) => (
        <PreferredRoute key={index} candidate={candidate} selected={matches.selected_candidate_index === index} />
      ))}
    </div>
  );
};
