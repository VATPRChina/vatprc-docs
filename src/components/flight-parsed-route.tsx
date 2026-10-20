import mapStyle from "@/assets/map/voyager_without_boundary.json";
import { Map } from "@/components/airspace/map";
import { RequireRole } from "@/components/require-role";
import { RouteSegments } from "@/components/route-segments";
import { SidCandidates } from "@/components/sid-candidates";
import type { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { buildRouteMap, hasPosition, type RouteLeg } from "@/lib/flight-route-map";
import { cn } from "@/lib/utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, SegmentedControl, Skeleton } from "@mantine/core";
import { Layer, NavigationControl, Source, type MapRef, type StyleSpecification } from "@vis.gl/react-maplibre";
import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";

type FlightPlan = Pick<components["schemas"]["FlightDto"], "departure" | "arrival" | "raw_route">;
const UNKNOWN_COLOR = "text-red-600 dark:text-red-400";
const SID_STAR_STYLE = "underline";

export const FlightParsedRoute = ({ flight }: { flight: FlightPlan }) => (
  <RequireRole role="software-engineer">
    <ParsedRoute
      route={[flight.departure, flight.raw_route, flight.arrival]
        .map((part) => part?.trim() ?? "")
        .filter(Boolean)
        .join(" ")}
      available={Boolean(flight.departure?.trim() && flight.arrival?.trim())}
    />
  </RequireRole>
);

export function ParsedRoute({ route, available = true }: { route: string; available?: boolean }) {
  const { t } = useLingui();
  const { data, error, isLoading } = $api.useQuery(
    "get",
    "/api/flights/route/v2",
    { params: { query: { route } } },
    { enabled: available, retry: false },
  );

  return (
    <section aria-label={t`Parsed route`} className="flex w-full flex-col gap-3">
      {!available && (
        <Alert>
          <Trans>No complete flight plan route is available.</Trans>
        </Alert>
      )}
      {error && (
        <Alert color="red" title={error.title ?? t`Route parsing failed`}>
          {error.detail ?? t`Unable to load the parsed route.`}
        </Alert>
      )}
      {isLoading && <Skeleton h={384} />}
      {available && !error && data && (
        <Fragment key={route}>
          <RouteResult legs={data.legs} segments={data.segments ?? data.domestic_segments} />
          <RouteSegments segments={data.segments ?? []} />
          <SidCandidates candidates={data.sid_candidates} />
        </Fragment>
      )}
    </section>
  );
}

export function RouteResult({
  legs: fullLegs,
  segments = [],
  style = mapStyle as unknown as StyleSpecification,
}: {
  legs: RouteLeg[];
  segments?: Pick<components["schemas"]["FlightRouteSegment"], "identifier" | "start_index" | "end_index">[];
  style?: StyleSpecification;
}) {
  const { t } = useLingui();
  const ref = useRef<MapRef>(null);
  const [selection, setSelection] = useState("full");
  const segmentKey = (
    segment: Pick<components["schemas"]["FlightRouteSegment"], "identifier" | "start_index" | "end_index">,
  ) => `${segment.start_index}:${segment.end_index}:${segment.identifier}`;
  const selectedSegment = segments.find((segment) => segmentKey(segment) === selection);
  const legs = useMemo(
    () => (selectedSegment ? fullLegs.slice(selectedSegment.start_index, selectedSegment.end_index) : fullLegs),
    [fullLegs, selectedSegment],
  );

  const geometry = useMemo(() => buildRouteMap(legs), [legs]);

  const fitRoute = useCallback(() => {
    if (geometry.bounds) ref.current?.fitBounds(geometry.bounds, { padding: 40, maxZoom: 9, duration: 0 });
  }, [geometry.bounds]);
  useEffect(() => fitRoute(), [fitRoute]);

  if (!legs.length)
    return (
      <Alert>
        <Trans>The parser returned no route segments.</Trans>
      </Alert>
    );

  return (
    <>
      {geometry.bounds ? (
        <div
          aria-label={t`Parsed route map`}
          className="relative aspect-video w-full overflow-hidden rounded border border-black/15 dark:border-white/20"
        >
          <div className="absolute top-2 left-2 z-10 max-w-[calc(100%-4rem)] overflow-x-auto rounded shadow">
            <SegmentedControl
              aria-label={t`Route view`}
              size="xs"
              value={selectedSegment ? selection : "full"}
              onChange={setSelection}
              data={[
                { label: t`Full route`, value: "full" },
                ...segments.map((segment) => ({ label: segment.identifier, value: segmentKey(segment) })),
              ]}
            />
          </div>
          <Map
            ref={ref}
            initialViewState={{ bounds: geometry.bounds, fitBoundsOptions: { padding: 40, maxZoom: 9 } }}
            mapStyle={style}
            onLoad={fitRoute}
            scrollZoom={false}
            style={{ width: "100%", height: "100%" }}
          >
            <Source id="flight-route-segments" type="geojson" data={geometry.segments}>
              <Layer
                id="flight-route-lines"
                type="line"
                filter={["==", ["get", "is_mainland"], true]}
                paint={{
                  "line-color": ["case", ["boolean", ["get", "is_unknown"], false], "#dc2626", "#2563eb"],
                  "line-width": 3,
                }}
              />
              <Layer
                id="flight-route-lines-outside"
                type="line"
                filter={["==", ["get", "is_mainland"], false]}
                paint={{
                  "line-color": ["case", ["boolean", ["get", "is_unknown"], false], "#dc2626", "#2563eb"],
                  "line-width": 3,
                  "line-dasharray": [2, 2],
                }}
              />
            </Source>
            <Source id="flight-route-points" type="geojson" data={geometry.points}>
              <Layer
                id="flight-route-fixes"
                type="circle"
                paint={{
                  "circle-radius": 4,
                  "circle-color": "#2563eb",
                  "circle-stroke-color": "#ffffff",
                  "circle-stroke-width": 1.5,
                }}
              />
              <Layer
                id="flight-route-labels"
                type="symbol"
                layout={{
                  "text-field": ["get", "identifier"],
                  "text-size": 11,
                  "text-offset": [0, 1.2],
                  "text-anchor": "top",
                }}
                paint={{ "text-color": "#1e3a8a", "text-halo-color": "#ffffff", "text-halo-width": 1.5 }}
              />
            </Source>
            <NavigationControl showCompass={false} />
          </Map>
        </div>
      ) : (
        <Alert>
          <Trans>No resolved coordinates are available to display on the map.</Trans>
        </Alert>
      )}
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="w-8 border-t-2 border-blue-600" />
          <Trans>China mainland: either endpoint inside</Trans>
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="w-8 border-t-2 border-dashed border-blue-600" />
          <Trans>Outside China mainland</Trans>
        </span>
      </div>
      <p className="flex flex-wrap items-center gap-2 font-mono">
        <span className={!hasPosition(legs[0].from) ? UNKNOWN_COLOR : undefined}>{legs[0].from.identifier}</span>
        {legs.map((leg, index) => (
          <Fragment key={index}>
            <span
              title={leg.is_mainland ? t`China mainland: either endpoint inside` : t`Outside China mainland`}
              className={cn(
                (leg.is_unknown || !leg.leg_identifier) && UNKNOWN_COLOR,
                (leg.is_sid || leg.is_star) && SID_STAR_STYLE,
                "text-sm",
              )}
            >
              {leg.leg_identifier || "DCT"}
            </span>
            <span className={cn(!hasPosition(leg.to) && UNKNOWN_COLOR)}>{leg.to.identifier}</span>
          </Fragment>
        ))}
      </p>
    </>
  );
}
