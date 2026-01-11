import { components } from "./api";
import { $api } from "./client/client";
import { isBefore } from "date-fns";

export { $api } from "./client/client";
export { login, logout } from "./client/auth";

export type UserRole = components["schemas"]["UserRoleDto"];

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

export const useUser = () => {
  const { data } = $api.useQuery("get", "/api/session", {}, { retry: false });
  return data?.user;
};

export const useControllerPermissions = () => {
  const { data } = $api.useQuery("get", "/api/users/me/atc/status", {}, { retry: false });
  return (
    data?.permissions.filter(
      (p) => !(p.state === "solo" && p.solo_expires_at && isBefore(Date.now(), p.solo_expires_at)),
    ) ?? []
  );
};

const POSITION_STATE_PRIORITY: Record<components["schemas"]["UserControllerState"], number> = {
  student: 0,
  "under-mentor": 1,
  solo: 2,
  certified: 3,
  mentor: 4,
};

export const useControllerPermission = (
  positionKind: string,
  minimumState: components["schemas"]["UserControllerState"],
) => {
  const { data } = $api.useQuery("get", "/api/users/me/atc/status", {}, { retry: false });
  if (!data) return false;
  const permission = data.permissions.find((p) => p.position_kind_id === positionKind);
  if (!permission) return false;
  if (POSITION_STATE_PRIORITY[permission.state] < POSITION_STATE_PRIORITY[minimumState]) return false;
  if (permission.state === "solo" && permission.solo_expires_at && !isBefore(Date.now(), permission.solo_expires_at)) {
    return false;
  }
  return true;
};
