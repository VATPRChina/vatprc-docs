import { RouteResult } from "../flight-parsed-route";
import { InlineValidations } from "./flight-v2";
import { PreferredRoutes } from "./preferred-route";
import { SegmentMetadata } from "./segment-metadata";
import { components } from "@/lib/api";
import { Trans, useLingui } from "@lingui/react/macro";
import { Accordion, Badge } from "@mantine/core";
import { FC } from "react";

const Segment: FC<{
  data: components["schemas"]["FlightV2Dto"];
  segment: components["schemas"]["FlightV2Segment"];
  index: number;
}> = ({ data, segment, index }) => {
  const { t } = useLingui();

  const segmentNumber = index + 1;
  const results = data.validations.filter(
    (result) => result.scope.level === "segment" && result.scope.segment_index === index,
  );
  const report = data.preferred_route_matching?.find((report) => report.segment_index === index);
  return (
    <Accordion.Item key={segment.identifier} value={index.toString()}>
      <div className="flex items-center gap-2">
        <Accordion.Control className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold">
              <Trans>Segment {segmentNumber}</Trans> · {segment.identifier}
            </h3>
            <Badge variant="light">{segment.kind === "mainland" ? t`Mainland` : t`International`}</Badge>
          </div>
        </Accordion.Control>
        <div className="pr-4">
          <InlineValidations results={results} />
        </div>
      </div>
      <Accordion.Panel>
        <div className="flex flex-col gap-4">
          <SegmentMetadata segment={segment} />
          <RouteResult
            legs={segment.legs}
            legAnnotations={(offset) => {
              const legIndex = segment.start_index + offset;
              const legNumber = legIndex + 1;
              return (
                <span aria-label={t`Leg ${legNumber} validations`}>
                  <InlineValidations
                    results={data.validations.filter(
                      (result) =>
                        result.scope.level === "leg" &&
                        result.scope.segment_index === index &&
                        result.scope.leg_index === legIndex,
                    )}
                  />
                </span>
              );
            }}
          />
          <section aria-label={t`Preferred routes`}>
            <h4 className="mb-2 font-semibold">
              <Trans>Preferred routes</Trans>
            </h4>
            <PreferredRoutes matches={report} />
          </section>
        </div>
      </Accordion.Panel>
    </Accordion.Item>
  );
};

export const Segments: FC<{ data: components["schemas"]["FlightV2Dto"] }> = ({ data }) => {
  if (!data.segments) {
    return (
      <p className="text-muted-foreground">
        <Trans>Route segments are unavailable. See the diagnostic error above.</Trans>
      </p>
    );
  }

  if (data.segments.length === 0) {
    return (
      <p>
        <Trans>No results.</Trans>
      </p>
    );
  }

  return (
    <Accordion multiple={true}>
      {data.segments.map((segment, index) => (
        <Segment key={index} data={data} segment={segment} index={index} />
      ))}
    </Accordion>
  );
};
