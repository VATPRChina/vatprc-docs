import { LanguageSwitch } from "./LanguageSwitch";
import "./header.css";
import logo from "@/assets/logo_standard.svg";
import logoWhite from "@/assets/logo_standard_white.svg";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a ref={ref} className={cn("nav-list-item", className)} {...props}>
          <div className="title">{title}</div>
          <p className="description">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export const Header: React.FC = () => {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 w-full border-b-[1px] bg-white px-8 py-2 dark:border-slate-700 dark:bg-black">
      <div className="flex items-center gap-4">
        <Link href="/">
          <Image
            src={logo}
            alt={t("Legacy.title")}
            height={48}
            className="dark:hidden"
          />
          <Image
            src={logoWhite}
            alt={t("Legacy.title")}
            height={48}
            className="hidden dark:block"
          />
        </Link>
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                {t("Legacy.nav-menu.about")}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-4">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="https://community.vatprc.net/c/69-category/12-category/12"
                        target="_blank"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium">
                          {t("Legacy.nav-menu.announcement")}
                        </div>
                        {/* <p className="text-sm leading-tight text-muted-foreground">
                          Beautifully designed components that you can copy and
                          paste into your apps. Accessible. Customizable. Open
                          Source.
                        </p> */}
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem
                    title={t("Legacy.nav-menu.introduction")}
                  ></ListItem>
                  <ListItem title={t("Legacy.nav-menu.staff")}></ListItem>
                  <ListItem title={t("Legacy.nav-menu.privacy")}></ListItem>
                  <ListItem
                    title={t("Legacy.nav-menu.logo-pack")}
                    href="https://files.vatprc.net/VATPRC_2022_Logo_Pack_v1.0.zip"
                    target="_blank"
                  ></ListItem>
                  <li className="row-span-4">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="https://community.vatprc.net"
                        target="_blank"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium">
                          {t("Legacy.nav-menu.forum")}
                        </div>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <li className="row-span-4">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href={
                          locale === "zh-cn"
                            ? "https://community.vatprc.net/c/events/66-category/66"
                            : "https://vatsim.net/events/"
                        }
                        target="_blank"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium">
                          {t("Legacy.nav-menu.event")}
                        </div>
                      </a>
                    </NavigationMenuLink>
                  </li>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                {t("Legacy.nav-menu.operation")}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="nav-list-grid">
                  <ListItem title={t("Legacy.nav-menu.fir")}></ListItem>
                  <ListItem title={t("Legacy.nav-menu.rvsm")}></ListItem>
                  <ListItem
                    title={t("Legacy.nav-menu.atc-positions-frequencies")}
                  ></ListItem>
                  <ListItem title={t("Legacy.nav-menu.sop")}></ListItem>
                  <ListItem title={t("Legacy.nav-menu.vfr")}></ListItem>
                  <ListItem
                    title={t("Legacy.nav-menu.charts")}
                    href="https://chartfox.org/"
                    target="_blank"
                  ></ListItem>
                  <ListItem
                    title={t("Legacy.nav-menu.vacdm")}
                    href="https://vacdm.vatprc.net/"
                    target="_blank"
                  ></ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                {t("Legacy.nav-menu.pilot")}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="nav-list-grid">
                  <ListItem
                    title={t("Legacy.nav-menu.start-to-fly")}
                  ></ListItem>
                  <ListItem
                    title={t("Legacy.nav-menu.introduction-to-fly")}
                  ></ListItem>
                  <ListItem title={t("Legacy.nav-menu.ts3")}></ListItem>
                  <ListItem
                    title={t("Legacy.nav-menu.pilot-softwares")}
                  ></ListItem>
                  <ListItem
                    title={t("Legacy.nav-menu.weather")}
                    href="https://metar-taf.com/"
                    target="_blank"
                  ></ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                {t("Legacy.nav-menu.atc")}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="nav-list-grid">
                  <ListItem
                    title={t("Legacy.nav-menu.controller-regulations")}
                  ></ListItem>
                  <ListItem
                    title={t("Legacy.nav-menu.become-a-controller")}
                  ></ListItem>
                  <ListItem
                    title={t("Legacy.nav-menu.controller-list")}
                  ></ListItem>
                  <ListItem
                    title={t("Legacy.nav-menu.atc-center")}
                    href="https://atc.vatprc.net"
                    target="_blank"
                  ></ListItem>
                  <ListItem
                    title={t("Legacy.nav-menu.moodle")}
                    href="https://moodle.vatprc.net"
                    target="_blank"
                  ></ListItem>
                  <ListItem title={t("Legacy.nav-menu.sector")}></ListItem>
                  <ListItem title={t("Legacy.nav-menu.loa")}></ListItem>
                  <ListItem
                    title={t("Legacy.nav-menu.visiting-and-transferring")}
                  ></ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <LanguageSwitch className="ml-auto hover:text-vatprc dark:text-white">
          <Languages size={18} />
        </LanguageSwitch>
      </div>
    </header>
  );
};
