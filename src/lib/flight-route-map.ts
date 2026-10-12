import type { components } from "@/lib/api";

export type RouteLeg = components["schemas"]["FlightRouteLeg"];
export type RouteFix = components["schemas"]["FlightRouteFix"];

export const hasPosition = (fix: RouteFix): fix is RouteFix & { latitude: number; longitude: number } =>
  !fix.is_unknown &&
  typeof fix.latitude === "number" &&
  typeof fix.longitude === "number" &&
  Number.isFinite(fix.latitude) &&
  Number.isFinite(fix.longitude) &&
  Math.abs(fix.latitude) <= 90 &&
  Math.abs(fix.longitude) <= 180;

const unwrapLongitude = (longitude: number, reference: number) =>
  longitude + 360 * Math.round((reference - longitude) / 360);

type Point = GeoJSON.Feature<GeoJSON.Point, { identifier: string }>;
type Segment = GeoJSON.Feature<GeoJSON.LineString, { identifier: string; is_unknown: boolean }>;

/** Keep date-line crossings local and never draw through an unresolved fix. */
export const buildRouteMap = (legs: readonly RouteLeg[]) => {
  const geometry = legs.reduce<{ longitude?: number; points: Point[]; segments: Segment[] }>(
    (previous, leg) => {
      const from = hasPosition(leg.from)
        ? [unwrapLongitude(leg.from.longitude, previous.longitude ?? leg.from.longitude), leg.from.latitude]
        : undefined;
      const to = hasPosition(leg.to)
        ? [unwrapLongitude(leg.to.longitude, from?.[0] ?? previous.longitude ?? leg.to.longitude), leg.to.latitude]
        : undefined;
      const point = (fix: RouteFix, coordinates: number[]): Point => ({
        type: "Feature",
        properties: { identifier: fix.identifier },
        geometry: { type: "Point", coordinates },
      });
      const segment: Segment[] =
        from && to
          ? [
              {
                type: "Feature",
                properties: {
                  identifier: leg.leg_identifier || "DCT",
                  is_unknown: leg.is_unknown || !leg.leg_identifier,
                },
                geometry: { type: "LineString", coordinates: [from, to] },
              },
            ]
          : [];
      return {
        longitude: to?.[0] ?? from?.[0] ?? previous.longitude,
        points: [...previous.points, ...(from ? [point(leg.from, from)] : []), ...(to ? [point(leg.to, to)] : [])],
        segments: [...previous.segments, ...segment],
      };
    },
    { points: [], segments: [] },
  );
  const points = Array.from(
    new Map(
      geometry.points.map((point) => [
        JSON.stringify([point.properties.identifier, point.geometry.coordinates]),
        point,
      ]),
    ).values(),
  );
  const longitudes = points.map((point) => point.geometry.coordinates[0]);
  const latitudes = points.map((point) => Math.max(-85, Math.min(85, point.geometry.coordinates[1])));
  const bounds: [number, number, number, number] | undefined = points.length
    ? [Math.min(...longitudes), Math.min(...latitudes), Math.max(...longitudes), Math.max(...latitudes)]
    : undefined;
  return {
    bounds,
    points: { type: "FeatureCollection", features: points } satisfies GeoJSON.FeatureCollection<GeoJSON.Point>,
    segments: {
      type: "FeatureCollection",
      features: geometry.segments,
    } satisfies GeoJSON.FeatureCollection<GeoJSON.LineString>,
    unresolved: Array.from(
      new Set(
        legs
          .flatMap((leg) => [leg.from, leg.to])
          .filter((fix) => !hasPosition(fix))
          .map((fix) => fix.identifier),
      ),
    ),
  };
};
