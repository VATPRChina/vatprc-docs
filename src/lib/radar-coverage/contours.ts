import { CoverageResult } from "./types";
import { dissolve, featureCollection, flatten, polygonSmooth, simplify } from "@turf/turf";

/** Smooth display geometry only; coverage statistics keep the original sampled grid. */
export function coverageContours(cells: CoverageResult["cells"]): CoverageResult["cells"] {
  if (!cells.features.length) return { type: "FeatureCollection", features: [] };
  const first = cells.features[0].geometry.coordinates[0];
  const tolerance = Math.min(first[1][0] - first[0][0], first[2][1] - first[1][1]) * 0.35;
  const strips: CoverageResult["cells"]["features"] = [];
  // Combine adjacent cells into horizontal strips before dissolving to keep worker work small.
  for (const cell of cells.features) {
    const ring = cell.geometry.coordinates[0];
    const previous = strips.at(-1);
    const last = previous?.geometry.coordinates[0];
    if (
      previous?.properties.type === cell.properties.type &&
      last &&
      Math.abs(last[0][1] - ring[0][1]) < 1e-9 &&
      Math.abs(last[1][0] - ring[0][0]) < 1e-9
    ) {
      last[1] = [...ring[1]];
      last[2] = [...ring[2]];
    } else {
      strips.push({
        ...cell,
        geometry: { type: "Polygon", coordinates: [ring.map((point) => [...point])] },
      });
    }
  }
  const merged = dissolve(featureCollection(strips), { propertyName: "type" });
  const outlines = simplify(merged, { tolerance, highQuality: true });
  // Dissolve removes internal grid lines; Chaikin smoothing rounds the outer and hole boundaries.
  return flatten(polygonSmooth(outlines, { iterations: 2 })) as CoverageResult["cells"];
}
