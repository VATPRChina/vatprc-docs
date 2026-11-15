import { matchesValidationField } from "./validation-field";
import { expect, test } from "vitest";

test("matches leg validations by their global index", () => {
  expect(matchesValidationField({ kind: "leg", index: 4 }, { kind: "leg", index: 4 })).toBe(true);
  expect(matchesValidationField({ kind: "leg", index: 4 }, { kind: "leg", index: 0 })).toBe(false);
});

test("matches segment validations by the complete half-open leg range", () => {
  const field = { kind: "multiple-legs", from: 2, to: 5 } as const;
  expect(matchesValidationField(field, { kind: "multiple-legs", from: 2, to: 5 })).toBe(true);
  expect(matchesValidationField(field, { kind: "multiple-legs", from: 2, to: 6 })).toBe(false);
  expect(matchesValidationField(field, { kind: "multiple-legs", from: 3, to: 5 })).toBe(false);
  expect(matchesValidationField(field, { kind: "leg", index: 2 })).toBe(false);
});

test("continues matching flight plan fields by kind", () => {
  expect(matchesValidationField({ kind: "departure" }, { kind: "departure" })).toBe(true);
  expect(matchesValidationField({ kind: "departure" }, { kind: "arrival" })).toBe(false);
});
