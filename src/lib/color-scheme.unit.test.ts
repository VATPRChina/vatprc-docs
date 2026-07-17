import { nextColorScheme } from "./color-scheme";
import { describe, expect, it } from "vitest";

describe("nextColorScheme", () => {
  it("cycles light -> dark -> auto -> light", () => {
    expect(nextColorScheme("light")).toBe("dark");
    expect(nextColorScheme("dark")).toBe("auto");
    expect(nextColorScheme("auto")).toBe("light");
  });
});
