import { usePermission, UserRole } from "@/lib/client";
import { FC, PropsWithChildren } from "react";

interface RequireRoleProps {
  role: UserRole;
  children: React.ReactNode;
}

export const RequireRole: FC<PropsWithChildren<RequireRoleProps>> = ({ role, children }) => {
  const hasRole = usePermission(role);

  if (!hasRole) return null;
  return children;
};
