import mapStyle from "@/assets/map/voyager_without_boundary.json";
import { $api } from "@/lib/client";
import type { SectorFeatureCollection, SectorProperties } from "@/lib/sector-data";
import { Trans, useLingui } from "@lingui/react/macro";
import { SegmentedControl } from "@mantine/core";
import * as turf from "@turf/turf";
import { Layer, Map as MapView, NavigationControl, Source, StyleSpecification } from "@vis.gl/react-maplibre";
import { FilterSpecification } from "maplibre-gl";
import { useMemo, useState } from "react";

type ControllerType = "TWR" | "APP" | "CTR";
type ControllerTypeFilter = "ALL" | ControllerType;

interface SectorSelection {
  sectors: SectorProperties[];
  selectedSectorId: string;
}

const geofenceAspectRatio = 12 / 5;
const degreesToRadians = (degrees: number) => (degrees * Math.PI) / 180;
const radiansToDegrees = (radians: number) => (radians * 180) / Math.PI;
const latitudeToMercatorY = (latitude: number) => Math.log(Math.tan(Math.PI / 4 + degreesToRadians(latitude) / 2));
const mercatorYToLatitude = (mercatorY: number) => radiansToDegrees(Math.atan(Math.sinh(mercatorY)));
const createAspectRatioBounds = (
  [west, south, east, north]: [number, number, number, number],
  aspectRatio: number,
  paddingRatio: number,
): [number, number, number, number] => {
  const westX = degreesToRadians(west);
  const eastX = degreesToRadians(east);
  const southY = latitudeToMercatorY(south);
  const northY = latitudeToMercatorY(north);
  const paddedWidth = (eastX - westX) * (1 + paddingRatio * 2);
  const paddedHeight = (northY - southY) * (1 + paddingRatio * 2);
  const boundsWidth = Math.max(paddedWidth, paddedHeight * aspectRatio);
  const boundsHeight = Math.max(paddedHeight, paddedWidth / aspectRatio);
  const centerX = (westX + eastX) / 2;
  const centerY = (southY + northY) / 2;

  return [
    radiansToDegrees(centerX - boundsWidth / 2),
    mercatorYToLatitude(centerY - boundsHeight / 2),
    radiansToDegrees(centerX + boundsWidth / 2),
    mercatorYToLatitude(centerY + boundsHeight / 2),
  ];
};
const controllerTypeOrder: Record<ControllerType, number> = { TWR: 0, APP: 1, CTR: 2 };

const getControllerType = (atcId: string): ControllerType => {
  if (atcId.endsWith("_TWR")) return "TWR";
  if (atcId.endsWith("_APP")) return "APP";
  return "CTR";
};

const formatAltitude = (altitude: number, isUpperLimit = false) => {
  if (altitude === 0) return "SFC";
  if (isUpperLimit && altitude === 99999) return "UNL";
  return `${altitude.toLocaleString()} ft`;
};

export const SectorMap = ({ sectorData }: { sectorData: SectorFeatureCollection }) => {
  const { data } = $api.useQuery("get", "/api/compat/online-status");
  const { t } = useLingui();
  const [controllerTypeFilter, setControllerTypeFilter] = useState<ControllerTypeFilter>("ALL");
  const [selection, setSelection] = useState<SectorSelection>();

  const { sectorAreaById, geofence } = useMemo(() => {
    const rawAirspaceBounds = turf.bbox(sectorData) as [number, number, number, number];

    return {
      sectorAreaById: new Map(sectorData.features.map((feature) => [feature.properties.sector_id, turf.area(feature)])),
      geofence: createAspectRatioBounds(rawAirspaceBounds, geofenceAspectRatio, 0.08),
    };
  }, [sectorData]);

  const sectors = useMemo(() => {
    const onlineCallsigns = new Set(data?.controllers.map((controller) => controller.callsign) ?? []);

    return {
      ...sectorData,
      features: sectorData.features.map((feature) => ({
        ...feature,
        properties: {
          ...feature.properties,
          online: onlineCallsigns.has(feature.properties.atc_id),
          controller_type: getControllerType(feature.properties.atc_id),
        },
      })),
    } satisfies GeoJSON.FeatureCollection<GeoJSON.Polygon, SectorProperties>;
  }, [data?.controllers, sectorData]);
  const visibleControllerTypes = controllerTypeFilter === "ALL" ? ["TWR", "APP", "CTR"] : [controllerTypeFilter];
  const visibleSectorFilter = [
    "in",
    ["get", "controller_type"],
    ["literal", visibleControllerTypes],
  ] as FilterSpecification;
  const clickedSectorFilter = ["==", ["get", "sector_id"], selection?.selectedSectorId ?? ""] as FilterSpecification;
  const selectedSectorCount = selection?.sectors.length ?? 0;

  return (
    <section className="w-full">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="text-3xl font-medium">
            <Trans>Beijing FIR Airspace</Trans>
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <Trans>Online sectors are highlighted. Select an area to view overlapping sectors.</Trans>
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <SegmentedControl
            size="xs"
            aria-label={t`Filter sectors by controller type`}
            value={controllerTypeFilter}
            onChange={(value) => {
              setControllerTypeFilter(value);
              setSelection(undefined);
            }}
            data={[
              { label: t`All`, value: "ALL" },
              { label: "TWR", value: "TWR" },
              { label: "APP", value: "APP" },
              { label: "CTR", value: "CTR" },
            ]}
          />
          <div className="flex gap-3 font-mono text-sm text-gray-700 dark:text-gray-300">
            <span className="flex items-center gap-1.5">
              <span className="size-3 bg-emerald-500/70" aria-hidden />
              <Trans>Online</Trans>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-3 border border-gray-500" aria-hidden />
              <Trans>Offline</Trans>
            </span>
          </div>
        </div>
      </div>
      <div className="h-96 w-full overflow-hidden border border-black/15 md:h-120 dark:border-white/20">
        <MapView
          initialViewState={{ bounds: geofence }}
          maxBounds={geofence}
          minZoom={3}
          maxZoom={10}
          mapStyle={mapStyle as unknown as StyleSpecification}
          scrollZoom={false}
          interactiveLayerIds={["airspace-fill"]}
          onClick={(event) => {
            if (!event.features?.length) {
              setSelection(undefined);
              return;
            }

            const clickedSectors = Array.from(
              new Map(
                event.features.map((feature) => {
                  const properties = feature.properties as SectorProperties;
                  return [properties.sector_id, properties];
                }),
              ).values(),
            ).sort(
              (a, b) =>
                controllerTypeOrder[a.controller_type ?? getControllerType(a.atc_id)] -
                  controllerTypeOrder[b.controller_type ?? getControllerType(b.atc_id)] ||
                a.atc_id.localeCompare(b.atc_id),
            );
            const smallestSector = clickedSectors.reduce((smallest, sector) =>
              (sectorAreaById.get(sector.sector_id) ?? Number.POSITIVE_INFINITY) <
              (sectorAreaById.get(smallest.sector_id) ?? Number.POSITIVE_INFINITY)
                ? sector
                : smallest,
            );

            setSelection({
              sectors: clickedSectors,
              selectedSectorId: smallestSector.sector_id,
            });
          }}
          onMouseMove={(event) => {
            event.target.getCanvas().style.cursor = event.features?.length ? "pointer" : "";
          }}
          onMouseLeave={(event) => {
            event.target.getCanvas().style.cursor = "";
          }}
        >
          <Source id="airspace" type="geojson" data={sectors}>
            <Layer
              id="airspace-fill"
              type="fill"
              filter={visibleSectorFilter}
              paint={{
                "fill-color": ["case", ["get", "online"], "#059669", "#6b7280"],
                "fill-opacity": ["case", ["get", "online"], 0.35, 0],
              }}
            />
            <Layer
              id="airspace-line"
              type="line"
              filter={visibleSectorFilter}
              paint={{
                "line-color": ["case", ["get", "online"], "#047857", "#6b7280"],
                "line-opacity": ["case", ["get", "online"], 0.95, 0.65],
                "line-width": ["case", ["get", "online"], 2.5, 1],
              }}
            />
            <Layer
              id="airspace-online-label"
              type="symbol"
              minzoom={4}
              filter={["all", visibleSectorFilter, ["==", ["get", "online"], true]] as FilterSpecification}
              layout={{
                "text-field": ["get", "atc_id"],
                "text-size": 11,
                "text-overlap": "cooperative",
              }}
              paint={{
                "text-color": ["case", ["get", "online"], "#047857", "#374151"],
                "text-halo-color": "#ffffff",
                "text-halo-width": 1.5,
              }}
            />
            <Layer
              id="airspace-enroute-label"
              type="symbol"
              minzoom={4}
              filter={
                [
                  "all",
                  visibleSectorFilter,
                  ["==", ["get", "online"], false],
                  ["==", ["get", "controller_type"], "CTR"],
                ] as FilterSpecification
              }
              layout={{
                "text-field": ["get", "atc_id"],
                "text-size": 11,
                "text-overlap": "cooperative",
              }}
              paint={{
                "text-color": "#374151",
                "text-halo-color": "#ffffff",
                "text-halo-width": 1.5,
              }}
            />
            <Layer
              id="airspace-local-label"
              type="symbol"
              minzoom={6}
              filter={
                [
                  "all",
                  visibleSectorFilter,
                  ["==", ["get", "online"], false],
                  ["!=", ["get", "controller_type"], "CTR"],
                ] as FilterSpecification
              }
              layout={{
                "text-field": ["get", "atc_id"],
                "text-size": 11,
                "text-overlap": "cooperative",
              }}
              paint={{
                "text-color": "#374151",
                "text-halo-color": "#ffffff",
                "text-halo-width": 1.5,
              }}
            />
            <Layer
              id="airspace-clicked-line"
              type="line"
              filter={clickedSectorFilter}
              paint={{
                "line-color": "#c92a2a",
                "line-width": 4,
              }}
            />
          </Source>
          <NavigationControl showCompass={false} />
        </MapView>
      </div>
      {selection && (
        <aside
          aria-live="polite"
          className="mt-2 border border-black/15 bg-white p-3 font-mono text-sm text-gray-950 dark:border-white/20 dark:bg-gray-950 dark:text-gray-50"
        >
          {selection.sectors.length > 1 && (
            <p className="mb-2 text-xs font-bold text-gray-600 dark:text-gray-400">
              <Trans>{selectedSectorCount} sectors at this point</Trans>
            </p>
          )}
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {selection.sectors.map((sector) => (
              <button
                key={sector.sector_id}
                type="button"
                aria-pressed={sector.sector_id === selection.selectedSectorId}
                onClick={() =>
                  setSelection((current) => (current ? { ...current, selectedSectorId: sector.sector_id } : current))
                }
                className={`min-w-0 border p-3 text-left transition-colors ${
                  sector.sector_id === selection.selectedSectorId
                    ? "border-red-700 bg-red-50 dark:border-red-500 dark:bg-red-950/40"
                    : "border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
                }`}
              >
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-bold">{sector.atc_id}</p>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">{sector.controller_type}</span>
                </div>
                <p>{sector.name}</p>
                <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 text-xs">
                  <dt className="text-gray-500 dark:text-gray-400">
                    <Trans>Frequency</Trans>
                  </dt>
                  <dd>{sector.frequency_mhz.toFixed(3).replace(/0+$/, "").replace(/\.$/, "")} MHz</dd>
                  <dt className="text-gray-500 dark:text-gray-400">
                    <Trans>Altitude</Trans>
                  </dt>
                  <dd>
                    {formatAltitude(sector.lower_limit)} – {formatAltitude(sector.upper_limit, true)}
                  </dd>
                </dl>
              </button>
            ))}
          </div>
        </aside>
      )}
    </section>
  );
};
