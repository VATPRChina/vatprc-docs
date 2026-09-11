import { Map } from "./map";
import { Layer, type MapRef, Source } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { createRef } from "react";
import { expect, test } from "vitest";
import { render } from "vitest-browser-react";

test("loads GeoJSON through the bundled worker and renders map features", async () => {
  const ref = createRef<MapRef>();
  const errors: Error[] = [];
  const screen = await render(
    <Map
      ref={ref}
      style={{ width: 400, height: 300 }}
      initialViewState={{ longitude: 0, latitude: 0, zoom: 3 }}
      mapStyle={{ version: 8, sources: {}, layers: [] }}
      onError={(event) => errors.push(event.error)}
    >
      <Source
        id="test-area"
        type="geojson"
        data={{
          type: "Feature",
          properties: {},
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [-5, -5],
                [5, -5],
                [5, 5],
                [-5, 5],
                [-5, -5],
              ],
            ],
          },
        }}
      >
        <Layer id="test-fill" type="fill" paint={{ "fill-color": "#059669" }} />
      </Source>
    </Map>,
  );

  await expect.poll(() => ref.current?.queryRenderedFeatures({ layers: ["test-fill"] }).length ?? 0).toBeGreaterThan(0);
  expect(errors).toEqual([]);
  await screen.unmount();
});
