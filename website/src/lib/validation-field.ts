import type { components } from "./api";

type ValidationField = components["schemas"]["ValidationFieldDto"];

export function matchesValidationField(actual: ValidationField, expected: ValidationField): boolean {
  if (actual.kind !== expected.kind) return false;
  if (actual.kind === "leg" && expected.kind === "leg") return actual.index === expected.index;
  if (actual.kind === "multiple-legs" && expected.kind === "multiple-legs") {
    return actual.from === expected.from && actual.to === expected.to;
  }
  return true;
}
