import { Badge } from "@/components/ui/badge";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { getLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { NavigationMenuLink } from "@radix-ui/react-navigation-menu";
import { Link } from "@tanstack/react-router";
import { TbExternalLink } from "react-icons/tb";

interface NavigationMenuLinkProps {
  large?: boolean;
  href: string;
  external?: boolean;
  children: React.ReactNode;
  className?: string;
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

  return <NavigationMenuLink asChild>{link}</NavigationMenuLink>;
};

export const NavMenu: React.FC = () => {
  const contents = [
    {
      title: "About Us",
      content: (
        <ul className="nav-list-grid">
          <NavMenuLink
            href="https://community.vatprc.net/c/69-category/12-category/12"
            large
            external
            className="row-span-4"
          >
            Announcement
          </NavMenuLink>
          <NavMenuLink href="/division/introduction">Introduction</NavMenuLink>
          <NavMenuLink href="/division/staff">Staff</NavMenuLink>
          <NavMenuLink href="/division/privacy">Privacy Policy</NavMenuLink>
          <NavMenuLink href="https://files.vatprc.net/VATPRC_2022_Logo_Pack_v1.0.zip" external>
            Logo Pack
          </NavMenuLink>
          <NavMenuLink href="/division/meeting">Meeting Notes</NavMenuLink>
          <hr className="col-span-full" />
          <NavMenuLink href="https://community.vatprc.net" external>
            Forum
          </NavMenuLink>
          <NavMenuLink
            href={
              getLocale() === "zh-cn"
                ? "https://community.vatprc.net/c/events/66-category/66"
                : "https://vatsim.net/events/"
            }
            external
          >
            Event
          </NavMenuLink>
          <NavMenuLink href="/division/api" external>
            API Document
          </NavMenuLink>
        </ul>
      ),
    },
    {
      title: "Operation",
      content: (
        <ul className="nav-list-grid">
          <NavMenuLink href="/airspace/fir" large className="row-span-4">
            Airspace
          </NavMenuLink>
          <NavMenuLink href="/airspace/rvsm">China RVSM</NavMenuLink>
          <NavMenuLink href="/airspace/station">Controllers-positions-frequencies</NavMenuLink>
          <NavMenuLink href="/airspace/sop">Standard Operation Procedures</NavMenuLink>
          <NavMenuLink href="/airspace/vfr">VFR Policy</NavMenuLink>
        </ul>
      ),
    },
    {
      title: "Pilots",
      content: (
        <ul className="nav-list-grid">
          <NavMenuLink href="/pilot/start-to-fly" large className="row-span-2">
            Start to Fly
          </NavMenuLink>
          <NavMenuLink href="/pilot/introduction-to-fly">Introduction-to-fly</NavMenuLink>
          <NavMenuLink href="/pilot/ts3">Community Legacy_nav-menu_ts3 Teamspeak 3</NavMenuLink>
          <hr className="col-span-full" />
          <NavMenuLink href="/pilot/pilot-softwares" large className="row-span-3">
            Pilots-softwares
          </NavMenuLink>
          <NavMenuLink href="https://chartfox.org/">Charts</NavMenuLink>
          <NavMenuLink href="https://vacdm.vatprc.net/">vACDM</NavMenuLink>
          <NavMenuLink href="https://metar-taf.com/">Weather</NavMenuLink>
          <NavMenuLink href="/flights">
            Flight plan checker
            <Badge className="ml-2 rounded-full" variant="destructive">
              New
            </Badge>
          </NavMenuLink>
        </ul>
      ),
    },
    {
      title: "Controllers",
      content: (
        <ul className="nav-list-grid">
          <NavMenuLink href="/controller/controller-list" large className="row-span-3">
            Controller List
          </NavMenuLink>
          <NavMenuLink href="/controller/controller-regulations">Progression Guide</NavMenuLink>
          <NavMenuLink href="/controller/become-a-controller">Become a Controller</NavMenuLink>
          <NavMenuLink href="/controller/visiting-and-transferring">
            Visiting Legacy_nav-menu_visiting-and-transferring Transfer
          </NavMenuLink>
          <hr className="col-span-full" />
          <NavMenuLink href="https://atc.vatprc.net" large external className="row-span-3">
            Controllers-center
          </NavMenuLink>
          <NavMenuLink href="https://moodle.vatprc.net" external>
            Moodle
          </NavMenuLink>
          <NavMenuLink href="/controller/sector">Sector Files</NavMenuLink>
          <NavMenuLink href="/controller/loa">Letter of Agreement</NavMenuLink>
        </ul>
      ),
    },
  ];

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {contents.map((content) => (
          <NavigationMenuItem key={content.title}>
            <NavigationMenuTrigger>{content.title}</NavigationMenuTrigger>
            <NavigationMenuContent>{content.content}</NavigationMenuContent>
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  );
};
