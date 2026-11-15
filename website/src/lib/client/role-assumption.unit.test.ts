import { applyAssumedRoles } from "./role-assumption";
import { expect, test } from "vitest";

test("adds assumed roles to API requests", () => {
  const request = new Request("https://example.com/api/session");

  applyAssumedRoles(request, ["staff", "event-director"]);

  expect(request.headers.get("X-Role-Assume")).toBe("staff,event-director");
});

test("does not add an empty assumed-role header", () => {
  const request = new Request("https://example.com/api/session");

  applyAssumedRoles(request, []);

  expect(request.headers.has("X-Role-Assume")).toBe(false);
});
