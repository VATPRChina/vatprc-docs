import { pointInside } from "./model";
import { AIRSPACE_TYPES, Airspace, AirspaceType, Coordinate, RadarRegion } from "./types";

export const AIRSPACE_COLORS = { acc: "#2563eb", tma: "#16a34a", twr: "#db2777" };
export interface AirspaceEntry extends Airspace {
  key: string;
  type: AirspaceType;
}
export function airspaceEntries(region: RadarRegion): AirspaceEntry[] {
  return AIRSPACE_TYPES.flatMap((type) =>
    (region.airspace?.[type] ?? []).map((airspace, index) => ({ ...airspace, type, key: `${type}:${index}` })),
  );
}
export function altitudeLabel(value: number | null): string {
  if (value === null || value === Infinity) return "UNL";
  if (value === 0) return "GND";
  const levels: Record<number, number> = {
    2000: 600,
    3000: 900,
    3900: 1200,
    4900: 1500,
    5900: 1800,
    6900: 2100,
    7900: 2400,
    8900: 2700,
    9800: 3000,
    10800: 3300,
    11800: 3600,
    12800: 3900,
    13800: 4200,
    14800: 4500,
    15700: 4800,
    16700: 5100,
    17700: 5400,
    18700: 5700,
    19700: 6000,
    20700: 6300,
    21700: 6600,
    22600: 6900,
    23600: 7200,
    24600: 7500,
    25600: 7800,
    26600: 8100,
    27600: 8400,
    29100: 8900,
    30100: 9200,
    31100: 9500,
    32100: 9800,
    33100: 10100,
    34100: 10400,
    35100: 10700,
    36100: 11000,
    37100: 11300,
    38100: 11600,
    39100: 11900,
    40100: 12200,
    41100: 12500,
    43000: 13100,
    44900: 13700,
    46900: 14300,
    48900: 14900,
    50900: 15500,
  };
  return `${levels[value] ?? Math.round(value * 0.3048)} m`;
}
export function airspaceHeight(airspace: Airspace): string | null {
  if (airspace.lowerLimit === undefined || airspace.upperLimit === undefined) return null;
  return `${altitudeLabel(airspace.lowerLimit)} – ${altitudeLabel(airspace.upperLimit)}`;
}
function contains(position: Coordinate, points: Coordinate[]): boolean {
  if (points.length < 3) return false;
  // Include points exactly on an edge, including shared sector boundaries.
  for (let i = 0; i < points.length; i++) {
    const a = points[i],
      b = points[(i + 1) % points.length];
    const cross = (position[0] - a[0]) * (b[1] - a[1]) - (position[1] - a[1]) * (b[0] - a[0]);
    if (
      Math.abs(cross) < 1e-10 &&
      position[0] >= Math.min(a[0], b[0]) - 1e-10 &&
      position[0] <= Math.max(a[0], b[0]) + 1e-10 &&
      position[1] >= Math.min(a[1], b[1]) - 1e-10 &&
      position[1] <= Math.max(a[1], b[1]) + 1e-10
    )
      return true;
  }
  return pointInside(position, points);
}
export interface AirspaceBand {
  min: number;
  max: number;
  entries: AirspaceEntry[];
}
export function airspaceAtPosition(entries: AirspaceEntry[], position: Coordinate) {
  const matches = entries.filter((entry) => contains(position, entry.points));
  const known = matches.filter((entry) => entry.lowerLimit !== undefined && entry.upperLimit !== undefined);
  const unknown = matches.filter((entry) => entry.lowerLimit === undefined || entry.upperLimit === undefined);
  const levels = [
    ...new Set([0, Infinity, ...known.flatMap((entry) => [entry.lowerLimit!, entry.upperLimit ?? Infinity])]),
  ].sort((a, b) => a - b);
  const bands: AirspaceBand[] = [];
  for (let i = 0; i < levels.length - 1; i++) {
    const min = levels[i],
      max = levels[i + 1];
    const covering = known.filter((entry) => entry.lowerLimit! <= min && (entry.upperLimit ?? Infinity) >= max);
    const previous = bands.at(-1);
    if (previous && previous.entries.map((e) => e.key).join() === covering.map((e) => e.key).join()) {
      previous.max = max;
    } else {
      bands.push({ min, max, entries: covering });
    }
  }
  return { bands: bands.reverse(), unknown };
}
