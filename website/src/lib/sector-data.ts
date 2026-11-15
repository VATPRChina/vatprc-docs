export interface SectorProperties {
  sector_id: string;
  atc_id: string;
  name: string;
  callsign: string;
  frequency_mhz: number;
  lower_limit: number;
  upper_limit: number;
  online?: boolean;
  controller_type?: "TWR" | "APP" | "CTR";
}

export type SectorFeatureCollection = GeoJSON.FeatureCollection<GeoJSON.Polygon, SectorProperties>;

export const sectorDataUrl = "https://files.vatprc.net/sectors/__sector_test/Sectors_ZBPE.geojson";

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const isSectorFeatureCollection = (value: unknown): value is SectorFeatureCollection => {
  if (!isRecord(value) || value.type !== "FeatureCollection" || !Array.isArray(value.features)) return false;

  return value.features.every((feature) => {
    if (!isRecord(feature) || feature.type !== "Feature" || !isRecord(feature.geometry)) return false;
    if (feature.geometry.type !== "Polygon" || !Array.isArray(feature.geometry.coordinates)) return false;
    if (!isRecord(feature.properties)) return false;

    const properties = feature.properties;
    return (
      typeof properties.sector_id === "string" &&
      typeof properties.atc_id === "string" &&
      typeof properties.name === "string" &&
      typeof properties.callsign === "string" &&
      typeof properties.frequency_mhz === "number" &&
      typeof properties.lower_limit === "number" &&
      typeof properties.upper_limit === "number"
    );
  });
};

export const fetchZbpeSectors = async () => {
  const response = await fetch(sectorDataUrl, {
    headers: { accept: "application/geo+json, application/json" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!response.ok) throw new Error(`Failed to load ZBPE sectors: ${response.status}`);

  const data: unknown = await response.json();
  if (!isSectorFeatureCollection(data)) throw new Error("The ZBPE sector file has an invalid format.");

  return data;
};
