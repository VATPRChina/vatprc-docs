import firGeoJsonRaw from "@/assets/map/fir.geojson.json";
import mapStyle from "@/assets/map/voyager_without_boundary.json";
import { $api } from "@/lib/client";
import { Vplaaf } from "@/lib/client/vplaaf";
import { Trans } from "@lingui/react/macro";
import { Alert, LoadingOverlay } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import * as turf from "@turf/turf";
import { Layer, Map, NavigationControl, Source, StyleSpecification } from "@vis.gl/react-maplibre";
import { DataDrivenPropertyValueSpecification, ColorSpecification } from "maplibre-gl";
import { useMemo } from "react";

export const Route = createFileRoute("/_doc/airspace/restricted")({
  component: RouteComponent,
});

const firGeoJson = firGeoJsonRaw as GeoJSON.FeatureCollection;
const CENTER = turf.center(firGeoJson);
const GEOFENCE = turf.bbox(turf.transformScale(firGeoJson, 2));
const PRC_OUTLINE = firGeoJson;
const INITIAL_VIEW_STATE = {
  longitude: CENTER.geometry.coordinates[0],
  latitude: CENTER.geometry.coordinates[1],
  zoom: 2,
};
const COLOR_MAP = [
  "match",
  ["get", "category"],
  "Danger",
  "#d9480f",
  "Prohibit",
  "#c92a2a",
  "Restricted",
  "#e67700",
  "#e67700",
] satisfies DataDrivenPropertyValueSpecification<ColorSpecification>;

function RouteComponent() {
  const { data: areas } = $api.useQuery("get", "/api/compat/vplaaf/areas.json");
  const vplaafGeojson = useMemo(
    () =>
      (areas as unknown as Vplaaf) &&
      (areas as unknown as Vplaaf).areas
        .map((area) => {
          if (area.vertices.length < 1) {
            if (area.circle)
              return turf.circle(area.circle.center.split(",").map(Number).toReversed(), Number(area.circle.radius), {
                properties: area,
              });
            else return null;
          }
          const vertices = area.vertices.map((v) => v.split(",").map(Number).toReversed());
          if (
            vertices[0][0] !== vertices[vertices.length - 1][0] ||
            vertices[0][1] !== vertices[vertices.length - 1][1]
          ) {
            vertices.push(vertices[0]);
          }
          return turf.polygon([vertices], area);
        })
        .filter((f) => !!f),
    [areas],
  );
  const vplaafCentersGeojson = useMemo(
    () =>
      vplaafGeojson &&
      turf.featureCollection(vplaafGeojson.map((area) => turf.center(area, { properties: area.properties }))),
    [vplaafGeojson],
  );

  return (
    <div className="container mx-auto flex flex-col gap-4">
      <h1 className="text-3xl">
        <Trans>Restricted Airspaces</Trans>
      </h1>
      <Alert color="yellow">
        <Trans>
          The airspaces listed on this map are either prohibited, restricted, or dangerous. Please refer to{" "}
          <a href="https://www.vplaaf.org/airspace" target="_blank" rel="noreferrer" className="underline">
            vPLAAF&apos;s website
          </a>{" "}
          for the details. These airspaces are designated by vPLAAF and approved by VATPRC.
        </Trans>
      </Alert>
      <section className="aspect-video max-h-svh w-full">
        <Map
          initialViewState={INITIAL_VIEW_STATE}
          maxBounds={GEOFENCE.slice(0, 4) as [number, number, number, number]}
          style={{ width: "100%", height: "100%" }}
          mapStyle={mapStyle as unknown as StyleSpecification}
          maxZoom={10}
        >
          <LoadingOverlay visible={!areas} />
          {PRC_OUTLINE && (
            <Source id="firs" type="geojson" data={PRC_OUTLINE}>
              <Layer id="firs-line" type="line" source="firs" paint={{ "line-color": "#ffa8a8" }} />
            </Source>
          )}
          {vplaafGeojson && (
            <Source id="vplaaf" type="geojson" data={turf.featureCollection(vplaafGeojson)}>
              <Layer
                id="vplaaf-line"
                type="line"
                source="vplaaf"
                paint={{ "line-color": COLOR_MAP, "line-width": 3 }}
              />
              <Layer
                id="vplaaf-fill"
                type="fill"
                source="vplaaf"
                paint={{ "fill-color": COLOR_MAP, "fill-opacity": 0.3 }}
              />
            </Source>
          )}
          {vplaafGeojson && (
            <Source data={vplaafCentersGeojson} id="vplaaf-centers" type="geojson">
              <Layer
                id="vplaaf-text"
                minzoom={6}
                type="symbol"
                layout={{
                  "text-field": [
                    "format",
                    ["get", "name"],
                    {},
                    "\n",
                    {},
                    ["get", "usertext"],
                    { "font-scale": 0.8 },
                    "\n",
                    {},
                    ["get", "lower", ["get", "limits"]],
                    {},
                    " - ",
                    {},
                    ["get", "upper", ["get", "limits"]],
                    {},
                  ],
                  "text-overlap": "cooperative",
                }}
                paint={{
                  "text-color": COLOR_MAP,
                  "text-halo-color": "#ffffff",
                  "text-halo-width": 1,
                }}
              />
            </Source>
          )}
          <NavigationControl />
        </Map>
      </section>
      <section>
        <p>
          <Trans>
            This map is intended for flight simulation use only. The boundaries shown on the map represent FIR
            boundaries within the simulation environment only and bear no relation to any real-world FIR boundaries or
            geopolitical borders. They do not represent the views or positions of any country, region, or international
            organization regarding geopolitical boundaries.
          </Trans>
        </p>
        <p>
          <Trans>
            For technical limitations, the boundaries shown on the map may be outdated or simplified. Please adhere to
            local controllers&apos; instructions when flying.
          </Trans>
        </p>
      </section>
    </div>
  );
}
