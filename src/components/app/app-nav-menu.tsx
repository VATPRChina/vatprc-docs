import { RequireRole } from "../require-role";
import { LanguageToggle } from "./language-toggle";
import { ModeToggle } from "./theme-toggle";
import { UserInfo } from "./user-info";
import { components } from "@/lib/api";
import { usePermissions } from "@/lib/client";
import { getLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Trans } from "@lingui/react/macro";
import { Button, Drawer, Group, HoverCard, Stack } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { ComponentProps } from "react";
import { TbExternalLink } from "react-icons/tb";

interface NavigationMenuLinkProps {
  large?: boolean;
  href: string;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
  requireRole?: components["schemas"]["UserRoleDto"];
}

const NavMenuLink: React.FC<NavigationMenuLinkProps> = (props: NavigationMenuLinkProps) => {
  const { large, href, external, children, className } = props;

  const cnLink = large ? "large-item flex items-end" : "item";
  const inner = (
    <h3 className={cn(external && "flex items-center gap-2")}>
      {children}
      {external && <TbExternalLink size={12} />}
    </h3>
  );

  const link = external ? (
    <a role="listitem" className={cn(cnLink, className)} href={href} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    <Link role="listitem" className={cn(cnLink, className)} to={href}>
      {inner}
    </Link>
  );

  return link;
};

const contents = [
  {
    title: <Trans>About Us</Trans>,
    content: ({ locale }: { locale: "en" | "zh-cn" }) => (
      <ul className="nav-list-grid">
        <NavMenuLink
          href="https://community.vatprc.net/c/69-category/12-category/12"
          large
          external
          className="row-span-4"
        >
          <Trans>Announcement</Trans>
        </NavMenuLink>
        <NavMenuLink href="/division/introduction">
          <Trans>Introduction</Trans>
        </NavMenuLink>
        <NavMenuLink href="/division/staff">
          <Trans>Staff</Trans>
        </NavMenuLink>
        <NavMenuLink href="/division/privacy">
          <Trans>Privacy Policy</Trans>
        </NavMenuLink>
        <NavMenuLink href="https://files.vatprc.net/VATPRC_2022_Logo_Pack_v1.0.zip" external>
          <Trans>Logo Pack</Trans>
        </NavMenuLink>
        <NavMenuLink href="/division/meeting">
          <Trans>Meeting Notes</Trans>
        </NavMenuLink>
        <hr className="col-span-full" />
        <NavMenuLink href="https://community.vatprc.net" external>
          <Trans>Forum</Trans>
        </NavMenuLink>
        <NavMenuLink
          href={
            locale === "zh-cn" ? "https://community.vatprc.net/c/events/66-category/66" : "https://vatsim.net/events/"
          }
          external
        >
          <Trans>Event</Trans>
        </NavMenuLink>
        <NavMenuLink href="/division/api" external>
          <Trans>API Document</Trans>
        </NavMenuLink>
      </ul>
    ),
  },
  {
    title: <Trans>Operation</Trans>,
    content: () => (
      <ul className="nav-list-grid">
        <NavMenuLink href="/airspace/fir" large className="row-span-4">
          <Trans>Airspace</Trans>
        </NavMenuLink>
        <NavMenuLink href="/airspace/rvsm">
          <Trans>China RVSM</Trans>
        </NavMenuLink>
        <NavMenuLink href="/airspace/station">
          <Trans>ATC Positions & Frequencies</Trans>
        </NavMenuLink>
        <NavMenuLink href="/airspace/sop">
          <Trans>Standard Operation Procedures</Trans>
        </NavMenuLink>
        <NavMenuLink href="/airspace/vfr">
          <Trans>VFR Policy</Trans>
        </NavMenuLink>
      </ul>
    ),
  },
  {
    title: <Trans>Pilots</Trans>,
    content: () => (
      <ul className="nav-list-grid">
        <NavMenuLink href="/pilot/start-to-fly" large className="row-span-2">
          <Trans>Start to Fly</Trans>
        </NavMenuLink>
        <NavMenuLink href="/pilot/introduction-to-fly">
          <Trans>Introduction to Fly</Trans>
        </NavMenuLink>
        <NavMenuLink href="/pilot/ts3">
          <Trans>Community & Teamspeak 3</Trans>
        </NavMenuLink>
        <hr className="col-span-full" />
        <NavMenuLink href="/pilot/pilot-softwares" large className="row-span-3">
          <Trans>Pilot Softwares</Trans>
        </NavMenuLink>
        <NavMenuLink href="https://chartfox.org/" external>
          <Trans>Charts</Trans>
        </NavMenuLink>
        <NavMenuLink href="https://vacdm.vatprc.net/" external>
          <Trans>vACDM</Trans>
        </NavMenuLink>
        <NavMenuLink href="https://metar-taf.com/" external>
          <Trans>Weather</Trans>
        </NavMenuLink>
        <NavMenuLink href="/flights">
          <Trans>Flight plan checker</Trans>
        </NavMenuLink>
      </ul>
    ),
  },
  {
    title: <Trans>Controllers</Trans>,
    content: () => (
      <ul className="nav-list-grid">
        <NavMenuLink href="/controller/controller-list" large className="row-span-3">
          <Trans>Controller List</Trans>
        </NavMenuLink>
        <NavMenuLink href="/controller/controller-regulations">
          <Trans>Progression Guide</Trans>
        </NavMenuLink>
        <NavMenuLink href="/controller/become-a-controller">
          <Trans>Become a Controller</Trans>
        </NavMenuLink>
        <NavMenuLink href="/controller/visiting-and-transferring">
          <Trans>Visiting & Transfer</Trans>
        </NavMenuLink>
        <hr className="col-span-full" />
        <NavMenuLink href="https://atc.vatprc.net" large external className="row-span-3">
          <Trans>ATC Center</Trans>
        </NavMenuLink>
        <NavMenuLink href="https://moodle.vatprc.net" external>
          <Trans>Moodle</Trans>
        </NavMenuLink>
        <NavMenuLink href="/controller/sector">
          <Trans>Sector Files</Trans>
        </NavMenuLink>
        <NavMenuLink href="/controller/loa">
          <Trans>Letter of Agreement</Trans>
        </NavMenuLink>
      </ul>
    ),
  },
  {
    title: <Trans>Admin</Trans>,
    requiresRole: "volunteer" as const,
    content: () => (
      <ul className="nav-list-grid">
        <NavMenuLink href="/events">
          <Trans>Event</Trans>
        </NavMenuLink>
        <NavMenuLink href="/users">
          <Trans>User List</Trans>
        </NavMenuLink>
        <NavMenuLink href="/docs/utils/image">
          <Trans>Image Upload Tool</Trans>
        </NavMenuLink>
        <RequireRole role={["event-coordinator", "operation-director-assistant"]}>
          <NavMenuLink href="/navdata/preferred-routes">
            <Trans>Preferred Routes</Trans>
          </NavMenuLink>
        </RequireRole>
        <RequireRole role="controller-training-director-assistant">
          <NavMenuLink href="/controllers/applications">
            <Trans>ATC Applications</Trans>
          </NavMenuLink>
        </RequireRole>
        <RequireRole role={["controller", "controller-training-mentor"]}>
          <NavMenuLink href="/controllers/trainings">
            <Trans>ATC Trainings</Trans>
          </NavMenuLink>
        </RequireRole>
      </ul>
    ),
  },
];

export const NavMenu: React.FC<ComponentProps<typeof Group>> = (props) => {
  const locale = getLocale();
  const roles = usePermissions();

  return (
    <Group gap="md" {...props}>
      {contents.map((content, i) => {
        if (content.requiresRole && !roles.includes(content.requiresRole)) {
          return null;
        }
        return (
          <HoverCard key={i}>
            <HoverCard.Target>
              <Button variant="subtle" color="gray">
                {content.title}
              </Button>
            </HoverCard.Target>
            <HoverCard.Dropdown>
              <content.content locale={locale} />
            </HoverCard.Dropdown>
          </HoverCard>
        );
      })}
    </Group>
  );
};

export const NavMenuDrawer: React.FC<ComponentProps<typeof Drawer>> = (props) => {
  const roles = usePermissions();

  return (
    <Drawer {...props}>
      <Stack>
        <Group>
          <ModeToggle />
          <LanguageToggle />
          <UserInfo />
        </Group>
        {contents.map((content, i) => {
          if (content.requiresRole && !roles.includes(content.requiresRole)) {
            return null;
          }
          return (
            <div key={i}>
              <h3 className="mb-2 font-semibold">{content.title}</h3>
              <content.content locale={getLocale()} />
            </div>
          );
        })}
      </Stack>
    </Drawer>
  );
};
