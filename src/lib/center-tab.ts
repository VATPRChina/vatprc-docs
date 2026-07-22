export type AtcCenterTab = "mine" | "trainings" | "applications";

export const resolveCenterTab = (pathname: string): AtcCenterTab => {
  const normalized = pathname.replace(/^\/(en|zh-cn)(?=\/|$)/, "");
  if (normalized.startsWith("/controllers/trainings")) return "trainings";
  if (normalized.startsWith("/controllers/applications")) return "applications";
  return "mine";
};
