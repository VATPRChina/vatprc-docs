import mapStyle from "@/assets/map/voyager_without_boundary.json";
import { Button } from "@/components/ui/button";
import {
  AIRSPACE_COLORS,
  airspaceAtPosition,
  airspaceEntries,
  airspaceHeight,
  altitudeLabel,
} from "@/lib/radar-coverage/airspace";
import { coverageBounds, RADAR_COLORS } from "@/lib/radar-coverage/model";
import { CoverageResult, RadarRegion, RadarType } from "@/lib/radar-coverage/types";
import { Trans, useLingui } from "@lingui/react/macro";
import { circle, featureCollection, lineString, point } from "@turf/turf";
import { Layer, Map, MapRef, NavigationControl, Popup, Source, StyleSpecification } from "@vis.gl/react-maplibre";
import type { Popup as MapLibrePopup } from "maplibre-gl";
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { useEffect, useMemo, useRef, useState } from "react";

export interface RadarMapProps {
  region: RadarRegion;
  enabled: RadarType[];
  airspaceEnabled: string[];
  coverage: CoverageResult | null;
  selectedRadar: number | null;
  onSelectRadar: (index: number) => void;
}

export function RadarMap({ region, enabled, airspaceEnabled, coverage, selectedRadar, onSelectRadar }: RadarMapProps) {
  const { t } = useLingui();
  const ref = useRef<MapRef>(null);
  const [loaded, setLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [position, setPosition] = useState<{ lat: number; lng: number; contentHeight: number } | null>(null);
  const popupRef = useRef<MapLibrePopup>(null);
  useEffect(() => {
    if (!position) return;
    // Reposition after the portal content has its final size.
    const frame = requestAnimationFrame(() => popupRef.current?.setLngLat(position));
    return () => cancelAnimationFrame(frame);
  }, [position]);
  const entries = useMemo(() => airspaceEntries(region), [region]);
  const positionAirspace = useMemo(
    () => (position ? airspaceAtPosition(entries, [position.lat, position.lng]) : null),
    [entries, position],
  );
  const bounds = useMemo(() => coverageBounds(region), [region]);
  const fit = () => {
    if (bounds) ref.current?.fitBounds(bounds, { padding: 50, maxZoom: 8, duration: 0 });
  };
  useEffect(() => {
    if (loaded && bounds) ref.current?.fitBounds(bounds, { padding: 50, maxZoom: 8, duration: 0 });
  }, [bounds, loaded]);
  const terrainImage = useMemo(() => {
    const t = coverage?.terrain;
    if (!t) return null;
    const values = t.values;
    const canvas = document.createElement("canvas");
    canvas.width = t.cols;
    canvas.height = t.rows;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const pixels = ctx.createImageData(t.cols, t.rows);
    values.forEach((height, index) => {
      if (height === -9999) return;
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
  }, [coverage?.terrain]);
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
          .filter(
            (radar, index) =>
              enabled.includes(radar.type) && radar.maxRange > 0 && (selectedRadar === null || selectedRadar === index),
          )
          .map((radar) =>
            circle([radar.lon, radar.lat], radar.maxRange, {
              units: "nauticalmiles",
              steps: 90,
              properties: { color: RADAR_COLORS[radar.type] },
            }),
          ),
      ),
    [region, enabled, selectedRadar],
  );
  const boundaries = useMemo(
    () =>
      featureCollection([
        ...entries
          .filter((entry) => airspaceEnabled.includes(entry.key))
          .map((entry) =>
            lineString(
              entry.points.map((p) => [p[1], p[0]]),
              {
                color: AIRSPACE_COLORS[entry.type],
                name: `${entry.name} · ${airspaceHeight(entry) ?? t`Altitude not provided`}`,
              },
            ),
          ),
      ]),
    [region, entries, airspaceEnabled, t],
  );
  return (
    <div
      className="relative h-[60vh] min-h-96 w-full border border-black/15 lg:h-[calc(100vh-180px)] lg:min-h-[800px] dark:border-white/20 [&>.maplibregl-map]:h-full [&>.maplibregl-map]:w-full"
      aria-label={t`Radar coverage map`}
    >
      <Map
        ref={ref}
        workerUrl={maplibreWorkerUrl}
        initialViewState={
          bounds ? { bounds, fitBoundsOptions: { padding: 50, maxZoom: 8 } } : { longitude: 105, latitude: 35, zoom: 3 }
        }
        mapStyle={mapStyle as unknown as StyleSpecification}
        interactiveLayerIds={["radar-sites"]}
        onStyleData={() => setLoaded(true)}
        onError={() => setMapError(true)}
        onClick={(event) => {
          const index: unknown = event.features?.[0]?.properties?.index;
          if (typeof index === "number") {
            onSelectRadar(index);
            setPosition(null);
          } else {
            const matches = airspaceAtPosition(entries, [event.lngLat.lat, event.lngLat.lng]);
            if (!matches.unknown.length && !matches.bands.some((band) => band.entries.length)) {
              setPosition(null);
              return;
            }
            const height = event.target.getContainer().clientHeight;
            setPosition({
              lat: event.lngLat.lat,
              lng: event.lngLat.lng,
              contentHeight: Math.max(80, Math.min(320, Math.max(event.point.y, height - event.point.y) - 110)),
            });
          }
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
        {position && positionAirspace && (
          <Popup
            ref={popupRef}
            longitude={position.lng}
            latitude={position.lat}
            onClose={() => setPosition(null)}
            closeOnClick={false}
            maxWidth="340px"
          >
            <div className="min-w-56 text-gray-900">
              <h3 className="mb-1 pr-4 text-base font-semibold">
                <Trans>Airspace at this position</Trans>
              </h3>
              <div className="overflow-y-auto" style={{ maxHeight: position.contentHeight }} role="list">
                {positionAirspace.bands.map((band) => (
                  <div role="listitem" key={band.min} className="border-t border-gray-200 py-2">
                    <div className="mb-1 font-semibold">{altitudeLabel(band.max)}</div>
                    {band.entries.length ? (
                      band.entries.map((entry) => (
                        <div key={entry.key} className="grid grid-cols-[3rem_minmax(0,1fr)] items-start gap-2 py-0.5">
                          <span className="text-xs font-semibold" style={{ color: AIRSPACE_COLORS[entry.type] }}>
                            {entry.type.toUpperCase()}
                          </span>
                          <span>{entry.name}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500">
                        <Trans>No airspace</Trans>
                      </p>
                    )}
                    <div className="mt-1 font-semibold">{altitudeLabel(band.min)}</div>
                  </div>
                ))}
                {positionAirspace.unknown.length > 0 && (
                  <div className="border-t border-gray-200 py-2">
                    <p className="font-semibold">
                      <Trans>Altitude not provided</Trans>
                    </p>
                    {positionAirspace.unknown.map((entry) => (
                      <p key={entry.key}>
                        {entry.type.toUpperCase()} · {entry.name}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Popup>
        )}
      </Map>
      <Button className="absolute! top-3 left-3" size="xs" disabled={!bounds} onClick={fit} variant={"neutral"}>
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
