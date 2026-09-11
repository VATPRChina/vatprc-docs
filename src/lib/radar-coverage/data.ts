import { parseDataset } from "./import";

export const BUILTIN_REGIONS = [
  {
    code: "ZBPE",
    name: "ZBPE FIR Beijing",
  },
  {
    code: "ZGZU",
    name: "ZGZU FIR Guangzhou",
  },
  {
    code: "ZHWH",
    name: "ZHWH FIR Wuhan",
  },
  {
    code: "ZJSA",
    name: "ZJSA FIR Sanya",
  },
  {
    code: "ZLHW",
    name: "ZLHW FIR Lanzhou",
  },
  {
    code: "ZPKM",
    name: "ZPKM FIR Kunming",
  },
  {
    code: "ZSHA",
    name: "ZSHA FIR Shanghai",
  },
  {
    code: "ZWUQ",
    name: "ZWUQ FIR Urumqi",
  },
  {
    code: "ZYSH",
    name: "ZYSH FIR Shenyang",
  },
];

// Keep the supplied export intact and load it only when the viewer needs it.
// Parse the JSON assignment as data rather than executing a window global.
let dataset: ReturnType<typeof loadDataset> | undefined;
async function loadDataset() {
  const { default: source } = await import("@/assets/radar-data.js?raw");
  return parseRadarData(source);
}

export function parseRadarData(source: string) {
  const match = /^\s*window\.RADAR_DATA\s*=\s*([\s\S]*?)\s*;?\s*$/.exec(source);
  if (!match) throw new Error("Invalid radar data export");
  return parseDataset(match[1]);
}

export async function loadRegion(code: string) {
  dataset ??= loadDataset().catch((error: unknown) => {
    dataset = undefined;
    throw error;
  });
  const region = (await dataset).find((region) => region.code === code);
  if (!region) throw new Error("Unknown radar region");
  return region;
}
