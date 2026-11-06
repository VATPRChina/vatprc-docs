import dclAirports from "../../docs/dcl-airports.json";

export type AtcPositionGroup = "airport" | "terminal" | "area";

const DCL_AIRPORTS = new Set(dclAirports);

export function getAtcPositionCode(callsign: string): string {
  return callsign.trim().toUpperCase().split("_")[0];
}

export function getAtcPositionGroup(callsign: string): AtcPositionGroup {
  const suffix = callsign.trim().toUpperCase().split("_").at(-1);

  if (suffix === "CTR") return "area";
  if (suffix === "APP" || suffix === "DEP") return "terminal";
  return "airport";
}

export function supportsDcl(callsign: string): boolean {
  const normalized = callsign.trim().toUpperCase();
  if (!DCL_AIRPORTS.has(getAtcPositionCode(normalized))) return false;
  const parts = normalized.split("_");
  const suffix = parts.at(-1);
  if (suffix === "TWR" || suffix === "DEL") return true;
  if (suffix !== "GND") return false;
  return !parts.slice(1, -1).some((part) => part.startsWith("A"));
}
