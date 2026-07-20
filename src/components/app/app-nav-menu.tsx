import { RequireRole } from "../require-role";
import { LanguageToggle } from "./language-toggle";
import { ModeToggleSegmented } from "./theme-toggle";
import { UserInfo } from "./user-info";
import { usePermissions, UserRole } from "@/lib/client";
import { getActiveGroup, NavGroup as NavGroupData, NavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { msg } from "@lingui/core/macro";
import { useLingui } from "@lingui/react/macro";
import { Accordion, Button, Drawer, Group, Menu, Stack } from "@mantine/core";
import { Link, useLocation } from "@tanstack/react-router";
import { ComponentProps, Fragment, PropsWithChildren, useState } from "react";
import { TbChevronDown, TbExternalLink } from "react-icons/tb";

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
      { label: msg`vACDM`, href: "https://vacdm.vatprc.net/", external: true },
      { label: msg`Weather`, href: "https://metar-taf.com/", external: true },
      { label: msg`Flight plan checker`, href: "/flights" },
    ],
  },
  {
    title: msg`Controllers`,
    items: [
      { label: msg`Controller List`, href: "/controller/controller-list", large: true, className: "row-span-3" },
      { label: msg`Progression Guide`, href: "/controller/controller-regulations" },
      { label: msg`Controller Application`, href: "/controllers" },
      { label: msg`Visiting & Transfer`, href: "/controller/visiting-and-transferring" },
      { label: msg`ATC Center`, href: "/controllers", large: true, className: "row-span-3", divider: true },
      { label: msg`Moodle`, href: "https://moodle.vatprc.net", external: true },
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
        "block px-2 py-2.5 hover:bg-gray-50 active:bg-gray-100 dark:hover:bg-gray-900 dark:active:bg-gray-800",
        item.large && "font-bold",
      )
    : item.large
      ? cn("large-item flex items-end", item.className)
      : cn("item", item.className);

  const inner = (
    <h3 className={cn(item.external && "flex items-center gap-2")}>
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
  <ul className={row ? "flex flex-col" : group.singleColumn ? "nav-list-column" : "nav-list-grid"}>
    {group.items.map((item, i) => (
      <Fragment key={i}>
        {item.divider && <hr className={row ? "my-2 border-black/15 dark:border-white/20" : "col-span-full"} />}
        <MaybeRequireRole role={item.requireRole}>
          <NavMenuLink item={item} row={row} />
        </MaybeRequireRole>
      </Fragment>
    ))}
  </ul>
);

export const NavMenu: React.FC<ComponentProps<typeof Group>> = (props) => {
  const roles = usePermissions();
  const { i18n } = useLingui();
  const pathname = useLocation({ select: (location) => location.pathname });
  const activeIndex = getActiveGroup(pathname, contents);
  const [openedIndex, setOpenedIndex] = useState<number | null>(null);

  return (
    <Group gap="md" {...props}>
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
            <Menu.Dropdown>
              <NavGroupItems group={group} />
            </Menu.Dropdown>
          </Menu>
        );
      })}
    </Group>
  );
};

export const NavMenuDrawer: React.FC<ComponentProps<typeof Drawer>> = (props) => {
  const roles = usePermissions();
  const { i18n } = useLingui();
  const pathname = useLocation({ select: (location) => location.pathname });
  const activeIndex = getActiveGroup(pathname, contents);

  return (
    <Drawer {...props}>
      <Stack>
        <Group justify="space-between" className="mb-2">
          <Group gap="xs">
            <ModeToggleSegmented />
            <LanguageToggle />
          </Group>
          <UserInfo />
        </Group>
        <Accordion defaultValue={activeIndex === undefined ? null : String(activeIndex)}>
          {contents.map((group, i) => {
            if (group.requireRole && !roles.includes(group.requireRole)) {
              return null;
            }
            return (
              <Accordion.Item key={i} value={String(i)}>
                <Accordion.Control>{i18n._(group.title)}</Accordion.Control>
                <Accordion.Panel>
                  <NavGroupItems group={group} row />
                </Accordion.Panel>
              </Accordion.Item>
            );
          })}
        </Accordion>
      </Stack>
    </Drawer>
  );
};
