const isObject = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const isPosition = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.length >= 2 &&
  value.every((coordinate: unknown) => typeof coordinate === "number" && Number.isFinite(coordinate));

const isLine = (value: unknown): boolean => Array.isArray(value) && value.length >= 2 && value.every(isPosition);
const isRing = (value: unknown): boolean =>
  Array.isArray(value) &&
  value.length >= 4 &&
  value.every(isPosition) &&
  JSON.stringify(value[0]) === JSON.stringify(value[value.length - 1]);
const isPolygon = (value: unknown): boolean => Array.isArray(value) && value.length > 0 && value.every(isRing);

const isGeometry = (value: unknown): boolean => {
  if (!isObject(value)) return false;
  switch (value.type) {
    case "Point":
      return isPosition(value.coordinates);
    case "MultiPoint":
      return Array.isArray(value.coordinates) && value.coordinates.every(isPosition);
    case "LineString":
      return isLine(value.coordinates);
    case "MultiLineString":
      return Array.isArray(value.coordinates) && value.coordinates.every(isLine);
    case "Polygon":
      return isPolygon(value.coordinates);
    case "MultiPolygon":
      return Array.isArray(value.coordinates) && value.coordinates.every(isPolygon);
    case "GeometryCollection":
      return Array.isArray(value.geometries) && value.geometries.every(isGeometry);
    default:
      return false;
  }
};

const isFeature = (value: unknown): boolean =>
  isObject(value) &&
  value.type === "Feature" &&
  (value.geometry === null || isGeometry(value.geometry)) &&
  (value.properties === null || isObject(value.properties));

// Only validated JSON reaches MapLibre. Normalize bare geometries and features to a collection.
export const parseGeojson = (source: string): GeoJSON.FeatureCollection | undefined => {
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch {
    return undefined;
  }
  if (!isObject(value)) return undefined;
  if (value.type === "FeatureCollection" && Array.isArray(value.features) && value.features.every(isFeature)) {
    return value as unknown as GeoJSON.FeatureCollection;
  }
  if (isFeature(value)) {
    return { type: "FeatureCollection", features: [value as unknown as GeoJSON.Feature] };
  }
  if (isGeometry(value)) {
    return {
      type: "FeatureCollection",
      features: [{ type: "Feature", properties: {}, geometry: value as unknown as GeoJSON.Geometry }],
    };
  }
  return undefined;
};
