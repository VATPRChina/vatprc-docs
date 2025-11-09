import { components } from "./api";
import { $api } from "./client/client";

export { $api } from "./client/client";
export { login, logout } from "./client/auth";

type UserRole = components["schemas"]["UserRoleDto"];

export const usePermission = (role: UserRole) => {
  const { data } = $api.useQuery("get", "/api/session", {}, { retry: false });
  if (!data?.user) return false;
  return data.user.roles.includes(role) ?? false;
};

export const usePermissions = (): UserRole[] => {
  const { data } = $api.useQuery("get", "/api/session", {}, { retry: false });
  if (!data?.user) return [];
  return data.user.roles ?? [];
};
