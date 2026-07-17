import type { UserRole } from "@/lib/client";
import type { MessageDescriptor } from "@lingui/core";

export interface NavItem {
  label: MessageDescriptor;
  href: string;
  /** External link: opens in new tab with an external-link icon. */
  external?: boolean;
  /** Rendered as a large tile in the desktop mega-menu. */
  large?: boolean;
  /** Renders a divider before this item. */
  divider?: boolean;
  requireRole?: UserRole | UserRole[];
  /** Desktop grid placement tweaks, e.g. row-span. */
  className?: string;
}

export interface NavGroup {
  title: MessageDescriptor;
  requireRole?: UserRole;
  items: NavItem[];
}

type NavGroupLike = { items: { href: string; external?: boolean }[] };

const firstSegment = (path: string) => "/" + (path.split("/")[1] ?? "");

export const getActiveGroup = (pathname: string, groups: readonly NavGroupLike[]): number | undefined => {
  const normalized = pathname.replace(/^\/(en|zh-cn)(?=\/|$)/, "");
  const segment = firstSegment(normalized);
  if (segment === "/") return undefined;
  const index = groups.findIndex((group) =>
    group.items.some((item) => !item.external && firstSegment(item.href) === segment),
  );
  return index === -1 ? undefined : index;
};
