import { coverageContours } from "./contours";
import { DemLoader } from "./dem";
import { calculateCoverageAsync, coverageBounds, terrainPreview } from "./model";
import { CoverageRequest } from "./types";

const dem = new DemLoader();
let generation = 0;
self.onmessage = (event: MessageEvent<{ id: number; request?: CoverageRequest }>) => {
  const { id, request } = event.data;
  const current = ++generation;
  if (!request) return;
  const cancelled = () => current !== generation;
  void (async () => {
    try {
      const bounds = coverageBounds(request.region);
      if (!bounds) throw new Error("No coverage extent");
      const terrain = await dem.load(bounds);
      if (cancelled()) return;
      const result = await calculateCoverageAsync(request, terrain, cancelled);
      if (!result || cancelled()) return;
      result.cells = coverageContours(result.cells);
      result.terrain = terrainPreview(request.region, terrain);
      self.postMessage({ id, result });
    } catch (error) {
      if (!cancelled()) {
        console.error("Radar coverage calculation failed:", error);
        self.postMessage({ id, error: true });
      }
    }
  })();
};
