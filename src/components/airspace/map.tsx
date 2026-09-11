import { Map as MapLibre, type MapProps, type MapRef } from "@vis.gl/react-maplibre";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import { forwardRef } from "react";

// MapLibre's relative worker URL does not survive Vite's dependency optimization
// or production chunking. Bundle the worker and its imports explicitly.
export const Map = forwardRef<MapRef, MapProps>(function Map(props, ref) {
  return <MapLibre {...props} ref={ref} workerUrl={workerUrl} />;
});
