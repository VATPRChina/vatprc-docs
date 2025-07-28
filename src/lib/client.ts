import { $api } from "./client/client";

export { $api } from "./client/client";
export { login, logout } from "./client/auth";

export const usePermission = (role: string) => {
  const { data } = $api.useQuery("get", "/api/session", {}, { retry: false });
  if (!data?.user) return false;
  return data.user.roles.includes(role) ?? false;
};
