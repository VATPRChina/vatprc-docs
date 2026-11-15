import { createContext, useContext } from "react";

export interface CenterRoles {
  userId?: string;
  isController: boolean;
  canManageTrainings: boolean;
  canReviewApplications: boolean;
}

const CenterRolesContext = createContext<CenterRoles>({
  isController: false,
  canManageTrainings: false,
  canReviewApplications: false,
});

export const CenterRolesProvider = CenterRolesContext.Provider;

export const useCenterRoles = () => useContext(CenterRolesContext);
