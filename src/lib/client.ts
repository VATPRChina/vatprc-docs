import { $api } from "./client/client";
import { VatprcRole } from "./types/vatprc";

export { $api } from "./client/client";
export { login, logout } from "./client/auth";

export const usePermission = (role: VatprcRole) => {
  const { data } = $api.useQuery("get", "/api/session", {}, { retry: false });
  if (!data?.user) return false;
  return data.user.roles.includes(role) ?? false;
};

export const usePermissions = (): VatprcRole[] => {
  const { data } = $api.useQuery("get", "/api/session", {}, { retry: false });
  if (!data?.user) return [];
  return (data.user.roles ?? []) as VatprcRole[];
};
