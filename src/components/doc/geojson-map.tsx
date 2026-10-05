import mapStyle from "@/assets/map/voyager_without_boundary.json";
import { Map } from "@/components/airspace/map";
import { bbox } from "@turf/turf";
import { Layer, NavigationControl, Source, type StyleSpecification } from "@vis.gl/react-maplibre";
import { useMemo } from "react";

export default function GeojsonMap({
  data,
  style = mapStyle as unknown as StyleSpecification,
}: {
  data: GeoJSON.FeatureCollection;
  style?: StyleSpecification;
}) {
  const bounds = useMemo(() => {
    const extent = bbox(data, { recompute: true });
    return extent.every(Number.isFinite) ? (extent as [number, number, number, number]) : undefined;
  }, [data]);

  return (
    <div
      className="not-prose my-4 overflow-hidden rounded border border-black/15 dark:border-white/20"
      role="region"
      aria-label="GeoJSON map"
    >
      <Map
        style={{ width: "100%", height: 400 }}
        initialViewState={
          bounds
            ? { bounds, fitBoundsOptions: { padding: 32, maxZoom: 12 } }
            : { longitude: 105, latitude: 35, zoom: 3 }
        }
        mapStyle={style}
        scrollZoom={false}
      >
        <NavigationControl />
        <Source id="markdown-geojson" type="geojson" data={data}>
          <Layer
            id="markdown-geojson-fill"
            type="fill"
            filter={["==", ["geometry-type"], "Polygon"]}
            paint={{ "fill-color": "#059669", "fill-opacity": 0.25 }}
          />
          <Layer
            id="markdown-geojson-line"
            type="line"
            filter={["!=", ["geometry-type"], "Point"]}
            paint={{ "line-color": "#059669", "line-width": 2 }}
          />
          <Layer
            id="markdown-geojson-point"
            type="circle"
            filter={["==", ["geometry-type"], "Point"]}
            paint={{
              "circle-color": "#059669",
              "circle-radius": 6,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#ffffff",
            }}
          />
        </Source>
      </Map>
    </div>
  );
}
