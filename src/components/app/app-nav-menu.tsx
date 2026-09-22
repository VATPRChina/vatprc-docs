import { RequireRole } from "../require-role";
import { LanguageToggle } from "./language-toggle";
import { ModeToggleSegmented } from "./theme-toggle";
import { UserInfo } from "./user-info";
import { usePermissions, UserRole } from "@/lib/client";
import { cn } from "@/lib/utils";
import type { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react/macro";
import { Accordion, Button, Drawer, Menu } from "@mantine/core";
import { Link, useLocation } from "@tanstack/react-router";
import { ComponentProps, Fragment, PropsWithChildren, useState } from "react";
import { TbChevronDown, TbExternalLink } from "react-icons/tb";

interface NavItem {
  label: MessageDescriptor;
  href: string;
  external?: boolean;
  large?: boolean;
  divider?: boolean;
  requireRole?: UserRole | UserRole[];
  className?: string;
}

interface NavGroupData {
  title: MessageDescriptor;
  requireRole?: UserRole;
  singleColumn?: boolean;
  items: NavItem[];
}

const firstPathSegment = (path: string) => "/" + (path.split("/")[1] ?? "");

const getActiveGroup = (pathname: string, groups: readonly NavGroupData[]): number | undefined => {
  const segment = firstPathSegment(pathname.replace(/^\/(en|zh-cn)(?=\/|$)/, ""));
  if (segment === "/") return undefined;

  const index = groups.findIndex((group) =>
    group.items.some((item) => !item.external && firstPathSegment(item.href) === segment),
  );
  return index === -1 ? undefined : index;
};

const contents: NavGroupData[] = [
  {
    title: msg`About Us`,
    items: [
      { label: msg`Introduction`, href: "/division/introduction", large: true, className: "row-span-3" },
      { label: msg`Staff`, href: "/division/staff" },
      { label: msg`Privacy Policy`, href: "/division/privacy" },
      { label: msg`Division Policies`, href: "/division/policy" },
      { label: msg`Meeting Notes`, href: "/division/meeting" },
      { label: msg`Logo Pack`, href: "https://files.vatprc.net/VATPRC_2022_Logo_Pack_v1.0.zip", external: true },
      { label: msg`API Document`, href: "/division/api", external: true, divider: true },
    ],
  },
  {
    title: msg`Operation`,
    items: [
      { label: msg`Airspace`, href: "/airspace/fir", large: true, className: "row-span-4" },
      { label: msg`China RVSM`, href: "/airspace/rvsm" },
      { label: msg`ATC Positions & Frequencies`, href: "/airspace/station" },
      { label: msg`Standard Operation Procedures`, href: "/airspace/sop" },
      { label: msg`VFR Policy`, href: "/airspace/vfr" },
      { label: msg`Restricted Airspaces`, href: "/airspace/restricted" },
    ],
  },
  {
    title: msg`Pilots`,
    items: [
      { label: msg`Start to Fly`, href: "/pilot/start-to-fly", large: true, className: "row-span-2" },
      { label: msg`Introduction to Fly`, href: "/pilot/introduction-to-fly" },
      { label: msg`Community & Teamspeak 3`, href: "/pilot/ts3" },
      {
        label: msg`Pilot Softwares`,
        href: "/pilot/pilot-softwares",
        large: true,
        className: "row-span-3",
        divider: true,
      },
      { label: msg`Charts`, href: "https://chartfox.org/", external: true },
      { label: msg`Weather`, href: "https://metar-taf.com/", external: true },
      { label: msg`Flight plan checker`, href: "/flights" },
    ],
  },
  {
    title: msg`Controllers`,
    items: [
      { label: msg`ATC Center`, href: "/controllers", large: true, className: "row-span-4" },
      { label: msg`Controller List`, href: "/controller/controller-list" },
      { label: msg`Progression Guide`, href: "/controller/controller-regulations" },
      { label: msg`Controller Application`, href: "/controllers/applications/new" },
      { label: msg`Visiting & Transfer`, href: "/controller/visiting-and-transferring" },
      { label: msg`Moodle`, href: "https://moodle.vatprc.net", external: true, divider: true },
      { label: msg`Sector Files`, href: "/controller/sector" },
      { label: msg`Letter of Agreement`, href: "/controller/loa" },
    ],
  },
  {
    title: msg`Community`,
    singleColumn: true,
    items: [
      { label: msg`Forum`, href: "https://community.vatprc.net", external: true, large: true },
      { label: msg`Event`, href: "/events", large: true },
      {
        label: msg`Announcement`,
        href: "https://community.vatprc.net/c/69-category/12-category/12",
        external: true,
      },
    ],
  },
  {
    title: msg`Admin`,
    requireRole: "volunteer",
    items: [
      { label: msg`Event`, href: "/events" },
      { label: msg`User List`, href: "/users" },
      { label: msg`Image Upload Tool`, href: "/docs/utils/image" },
      { label: msg`Sheet Management`, href: "/sheets", requireRole: "staff" },
      {
        label: msg`Preferred Routes`,
        href: "/navdata/preferred-routes",
        requireRole: ["event-coordinator", "operation-director-assistant"],
      },
    ],
  },
];

const MaybeRequireRole: React.FC<PropsWithChildren<{ role?: UserRole | UserRole[] }>> = ({
  role,
  children,
}: PropsWithChildren<{ role?: UserRole | UserRole[] }>) =>
  role ? <RequireRole role={role}>{children}</RequireRole> : children;

const NavMenuLink: React.FC<{ item: NavItem; row?: boolean }> = ({ item, row }: { item: NavItem; row?: boolean }) => {
  const { i18n } = useLingui();
  const cnLink = row
    ? cn(
        "block p-4 hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-gray-900 dark:active:bg-gray-800",
        item.large && "font-bold",
      )
    : item.large
      ? cn("large-item flex items-end", item.className)
      : cn("item", item.className);

  const inner = (
    <h3 className={cn(item.external && "flex items-center gap-1")}>
      {i18n._(item.label)}
      {item.external && <TbExternalLink size={12} />}
    </h3>
  );

  return item.external ? (
    <a role="listitem" className={cnLink} href={item.href} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    <Link role="listitem" className={cnLink} to={item.href}>
      {inner}
    </Link>
  );
};

const NavGroupItems: React.FC<{ group: NavGroupData; row?: boolean }> = ({
  group,
  row,
}: {
  group: NavGroupData;
  row?: boolean;
}) => (
  <ul className={row ? "flex flex-col gap-1" : group.singleColumn ? "nav-list-column" : "nav-list-grid"}>
    {group.items.map((item, i) => (
      <Fragment key={i}>
        {item.divider && <hr className={row ? "my-1 border-black/15 dark:border-white/20" : "col-span-full"} />}
        <MaybeRequireRole role={item.requireRole}>
          <NavMenuLink item={item} row={row} />
        </MaybeRequireRole>
      </Fragment>
    ))}
  </ul>
);

export const NavMenu: React.FC<ComponentProps<"div">> = (props) => {
  const roles = usePermissions();
  const { i18n } = useLingui();
  const pathname = useLocation({ select: (location) => location.pathname });
  const activeIndex = getActiveGroup(pathname, contents);
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);

  return (
    <div {...props} className="flex flex-wrap items-center gap-1">
      {contents.map((group, i) => {
        if (group.requireRole && !roles.includes(group.requireRole)) {
          return null;
        }
        return (
          <Menu
            key={i}
            trigger="click-hover"
            position="bottom-start"
            opened={openedIndex === i}
            onChange={(opened) => setOpenedIndex((current) => (opened ? i : current === i ? null : current))}
          >
            <Menu.Target>
              <Button
                variant="subtle"
                color="gray"
                className="group"
                style={{
                  borderBottom: `2px solid ${i === activeIndex ? "var(--color-vatprc)" : "transparent"}`,
                }}
                rightSection={
                  <TbChevronDown size={14} className="transition-transform group-aria-expanded:rotate-180" />
                }
              >
                {i18n._(group.title)}
              </Button>
            </Menu.Target>
            <Menu.Dropdown className="flex flex-col gap-1">
              <NavGroupItems group={group} />
            </Menu.Dropdown>
          </Menu>
        );
      })}
    </div>
  );
};

export const NavMenuDrawer: React.FC<ComponentProps<typeof Drawer>> = (props) => {
  const roles = usePermissions();
  const { i18n } = useLingui();
  const pathname = useLocation({ select: (location) => location.pathname });
  const activeIndex = getActiveGroup(pathname, contents);

  return (
    <Drawer {...props}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <ModeToggleSegmented />
            <LanguageToggle />
          </div>
          <UserInfo />
        </div>
        <Accordion defaultValue={activeIndex === undefined ? null : String(activeIndex)}>
          {contents.map((group, i) => {
            if (group.requireRole && !roles.includes(group.requireRole)) {
              return null;
            }
            return (
              <Accordion.Item key={i} value={String(i)}>
                <Accordion.Control>{i18n._(group.title)}</Accordion.Control>
                <Accordion.Panel className="flex flex-col gap-1">
                  <NavGroupItems group={group} row />
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </div>
    </Drawer>
  );
};
