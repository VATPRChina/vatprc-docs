import { components } from "../api";
import { atomWithStorage, createJSONStorage } from "jotai/utils";
import { SyncStringStorage } from "jotai/vanilla/utils/atomWithStorage";
import { Middleware } from "openapi-fetch";

type UserRole = components["schemas"]["UserRole"];

const noopStorage: SyncStringStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

const storage = createJSONStorage<UserRole[]>(() => (typeof window !== "undefined" ? localStorage : noopStorage));

export const assumedRolesAtom = atomWithStorage<UserRole[]>("assumed_roles", [], storage, {
  getOnInit: true,
});

export const applyAssumedRoles = (request: Request, roles: UserRole[]) => {
  if (roles.length > 0) {
    request.headers.set("X-Role-Assume", roles.join(","));
  }
  return request;
};

export const createRoleAssumptionMiddleware = (getRoles: () => UserRole[]): Middleware => ({
  onRequest({ request }) {
    return applyAssumedRoles(request, getRoles());
  },
});
