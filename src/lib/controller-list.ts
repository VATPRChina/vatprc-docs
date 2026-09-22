import { components } from "./api";

type AtcStatusDto = components["schemas"]["AtcStatusDto"];

const RATINGS_ORDER = ["OBS", "S1", "S2", "S3", "C1", "C3", "I1", "I3"];

export const compareRatings = (a: string, b: string): number => RATINGS_ORDER.indexOf(b) - RATINGS_ORDER.indexOf(a);

export const compareControllers = (a: AtcStatusDto, b: AtcStatusDto): number => {
  if (a.rating !== b.rating) return compareRatings(a.rating, b.rating);
  if (a.is_visiting && !b.is_visiting) return 1;
  if (!a.is_visiting && b.is_visiting) return -1;
  if (a.is_absent) return 1;
  if (b.is_absent) return -1;
  return a.user.cid.localeCompare(b.user.cid);
};

const MILITARY_CIDS = new Set([
  "1326158",
  "1340265",
  "1435267",
  "1478847",
  "1496934",
  "1621162",
  "1676022",
  "1679151",
  "1752734",
  "1897662",
]);

export const isMilitaryController = (cid: string): boolean => MILITARY_CIDS.has(cid);
