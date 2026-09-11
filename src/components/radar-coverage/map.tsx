import mapStyle from "@/assets/map/voyager_without_boundary.json";
import { coverageBounds, decodeTerrain, RADAR_COLORS } from "@/lib/radar-coverage/model";
import { CoverageResult, RadarRegion, RadarType } from "@/lib/radar-coverage/types";
import { Trans, useLingui } from "@lingui/react/macro";
import { Button } from "@mantine/core";
import { circle, featureCollection, lineString, point } from "@turf/turf";
import { Layer, Map, MapRef, NavigationControl, Source, StyleSpecification } from "@vis.gl/react-maplibre";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { useEffect, useMemo, useRef, useState } from "react";

export interface RadarMapProps {
  region: RadarRegion;
  enabled: RadarType[];
  airspaceEnabled: string[];
  coverage: CoverageResult | null;
  onSelectRadar: (index: number) => void;
}

export function RadarMap({ region, enabled, airspaceEnabled, coverage, onSelectRadar }: RadarMapProps) {
  const { t } = useLingui();
  const ref = useRef<MapRef>(null);
  const [loaded, setLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const bounds = useMemo(() => coverageBounds(region), [region]);
  const fit = () => {
    if (bounds) ref.current?.fitBounds(bounds, { padding: 50, maxZoom: 8, duration: 0 });
  };
  useEffect(() => {
    if (loaded && bounds) ref.current?.fitBounds(bounds, { padding: 50, maxZoom: 8, duration: 0 });
  }, [bounds, loaded]);
  const terrainImage = useMemo(() => {
    const t = region.terrain;
    if (!t) return null;
    const values = decodeTerrain(t);
    const canvas = document.createElement("canvas");
    canvas.width = t.cols;
    canvas.height = t.rows;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const pixels = ctx.createImageData(t.cols, t.rows);
    values.forEach((height, index) => {
      if (height === -32768) return;
      const color =
        height < 200
          ? [159, 190, 165]
          : height < 800
            ? [173, 194, 149]
            : height < 1600
              ? [190, 190, 147]
              : height < 2800
                ? [185, 166, 136]
                : height < 4200
                  ? [165, 145, 130]
                  : [210, 207, 202];
      pixels.data.set([...color, 255], index * 4);
    });
    ctx.putImageData(pixels, 0, 0);
    return {
      url: canvas.toDataURL(),
      coordinates: [
        [t.minLon, t.maxLat],
        [t.maxLon, t.maxLat],
        [t.maxLon, t.minLat],
        [t.minLon, t.minLat],
      ] as [number, number][],
    };
  }, [region]);
  const sites = useMemo(
    () =>
      featureCollection(
        region.radars.flatMap((radar, index) =>
          enabled.includes(radar.type)
            ? [point([radar.lon, radar.lat], { index, color: RADAR_COLORS[radar.type] })]
            : [],
        ),
      ),
    [region, enabled],
  );
  const ranges = useMemo(
    () =>
      featureCollection(
        region.radars
          .filter((radar) => enabled.includes(radar.type) && radar.maxRange > 0)
          .map((radar) =>
            circle([radar.lon, radar.lat], radar.maxRange, {
              units: "nauticalmiles",
              steps: 90,
              properties: { color: RADAR_COLORS[radar.type] },
            }),
          ),
      ),
    [region, enabled],
  );
  const boundaries = useMemo(
    () =>
      featureCollection([
        ...(region.boundary.length >= 3
          ? [
              lineString(
                [...region.boundary, region.boundary[0]].map((p) => [p[1], p[0]]),
                { color: "#ab1615", name: region.code },
              ),
            ]
          : []),
        ...(["tma", "twr"] as const).flatMap((type) =>
          airspaceEnabled.includes(type)
            ? (region.airspace?.[type] ?? []).map((a) =>
                lineString(
                  a.points.map((p) => [p[1], p[0]]),
                  { color: type === "tma" ? "#16a34a" : "#db2777", name: a.name },
                ),
              )
            : [],
        ),
      ]),
    [region, airspaceEnabled],
  );
  return (
    <div
      className="relative h-[60vh] min-h-96 w-full border border-black/15 lg:h-[680px] dark:border-white/20"
      aria-label={t`Radar coverage map`}
    >
      <Map
        ref={ref}
        workerUrl={maplibreWorkerUrl}
        initialViewState={
          bounds ? { bounds, fitBoundsOptions: { padding: 50, maxZoom: 8 } } : { longitude: 105, latitude: 35, zoom: 3 }
        }
        mapStyle={mapStyle as unknown as StyleSpecification}
        style={{ width: "100%", height: "100%" }}
        interactiveLayerIds={["radar-sites"]}
        onStyleData={() => setLoaded(true)}
        onError={() => setMapError(true)}
        onClick={(event) => {
          const index: unknown = event.features?.[0]?.properties?.index;
          if (typeof index === "number") onSelectRadar(index);
        }}
      >
        {/* Mount upper layers first so async terrain/coverage always have stable insertion targets. */}
        <Source id="radar-sites-source" type="geojson" data={sites}>
          <Layer
            id="radar-sites"
            type="circle"
            paint={{
              "circle-color": ["get", "color"],
              "circle-radius": 6,
              "circle-stroke-color": "#ffffff",
              "circle-stroke-width": 2,
            }}
          />
        </Source>
        <Source id="radar-boundaries" type="geojson" data={boundaries}>
          <Layer
            id="radar-boundary-lines"
            beforeId="radar-sites"
            type="line"
            paint={{ "line-color": ["get", "color"], "line-width": 2 }}
          />
          <Layer
            id="radar-boundary-labels"
            beforeId="radar-sites"
            type="symbol"
            minzoom={5}
            layout={{ "symbol-placement": "line", "text-field": ["get", "name"], "text-size": 11 }}
            paint={{ "text-color": ["get", "color"], "text-halo-color": "#ffffff", "text-halo-width": 2 }}
          />
        </Source>
        <Source id="radar-ranges" type="geojson" data={ranges}>
          <Layer
            id="radar-range-lines"
            type="line"
            beforeId="radar-boundary-lines"
            paint={{ "line-color": ["get", "color"], "line-opacity": 0.5, "line-dasharray": [3, 4] }}
          />
        </Source>
        <Source id="radar-coverage" type="geojson" data={coverage?.cells ?? featureCollection([])}>
          <Layer
            id="radar-coverage-fill"
            type="fill"
            beforeId="radar-range-lines"
            paint={{
              "fill-color": [
                "match",
                ["get", "type"],
                "SSR",
                RADAR_COLORS.SSR,
                "ADSB",
                RADAR_COLORS.ADSB,
                "SMR",
                RADAR_COLORS.SMR,
                "fusion",
                RADAR_COLORS.fusion,
                RADAR_COLORS.unknown,
              ],
              "fill-opacity": 0.35,
            }}
          />
          <Layer
            id="radar-coverage-outline"
            type="line"
            beforeId="radar-range-lines"
            layout={{ "line-join": "round", "line-cap": "round" }}
            paint={{
              "line-color": [
                "match",
                ["get", "type"],
                "SSR",
                RADAR_COLORS.SSR,
                "ADSB",
                RADAR_COLORS.ADSB,
                "SMR",
                RADAR_COLORS.SMR,
                "fusion",
                RADAR_COLORS.fusion,
                RADAR_COLORS.unknown,
              ],
              "line-width": 1,
              "line-opacity": 0.6,
            }}
          />
        </Source>
        {terrainImage && (
          <Source
            id="radar-terrain"
            type="image"
            url={terrainImage.url}
            coordinates={
              terrainImage.coordinates as [[number, number], [number, number], [number, number], [number, number]]
            }
          >
            <Layer
              id="radar-terrain-shading"
              type="raster"
              beforeId="radar-coverage-fill"
              paint={{ "raster-opacity": 0.4, "raster-fade-duration": 0 }}
            />
          </Source>
        )}
        <NavigationControl />
      </Map>
      <Button className="absolute! top-3 left-3" size="xs" variant="white" disabled={!bounds} onClick={fit}>
        <Trans>Fit region</Trans>
      </Button>
      {mapError && (
        <p role="status" className="absolute right-2 bottom-8 left-2 bg-white p-2 text-sm text-gray-900">
          <Trans>Some map resources could not be loaded. Check your connection and reload the page.</Trans>
        </p>
      )}
    </div>
  );
}
