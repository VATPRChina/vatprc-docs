export type CenterView = "mine" | "management";

export const resolveCenterView = (view: string | undefined, canManage: boolean): CenterView =>
  view === "management" && canManage ? "management" : "mine";
