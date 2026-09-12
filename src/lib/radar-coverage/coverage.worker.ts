import { coverageContours } from "./contours";
import { calculateCoverage } from "./model";
import { CoverageRequest } from "./types";

self.onmessage = (event: MessageEvent<CoverageRequest>) => {
  try {
    const result = calculateCoverage(event.data);
    result.cells = coverageContours(result.cells);
    self.postMessage({ result });
  } catch {
    self.postMessage({ error: true });
  }
};
