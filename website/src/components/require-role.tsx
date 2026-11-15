import { usePermissions, UserRole } from "@/lib/client";
import { FC, PropsWithChildren } from "react";

interface RequireRoleProps {
  role: UserRole | UserRole[];
  children: React.ReactNode;
}

export const RequireRole: FC<PropsWithChildren<RequireRoleProps>> = ({ role, children }) => {
  const roles = usePermissions();
  const hasRole = Array.isArray(role) ? role.some((r) => roles.includes(r)) : roles.includes(role);

  if (!hasRole) return null;
  return children;
};
