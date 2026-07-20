export type CenterTab = "mine" | "trainings" | "applications";

export const resolveCenterTab = (pathname: string): CenterTab => {
  const normalized = pathname.replace(/^\/(en|zh-cn)(?=\/|$)/, "");
  if (normalized.startsWith("/controllers/trainings")) return "trainings";
  if (normalized.startsWith("/controllers/applications")) return "applications";
  return "mine";
};
