import "./Header.css";
import { LanguageSwitch } from "./LanguageSwitch";
import logo from "@/assets/logo_standard.svg";
import logoWhite from "@/assets/logo_standard_white.svg";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import { Link } from "@/i18n/routing";
import { ExternalLink, Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

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
                <div className="nav-list-grid">
                  <Link
                    className="large-item row-span-4 flex items-end"
                    href="https://community.vatprc.net/c/69-category/12-category/12"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex items-center gap-2">
                      {t("Legacy.nav-menu.announcement")}
                      <ExternalLink size={12} />
                    </div>
                  </Link>
                  <Link className="item" href="/division/introduction">
                    <h3>{t("Legacy.nav-menu.introduction")}</h3>
                  </Link>
                  <Link className="item" href="/division/staff">
                    <h3>{t("Legacy.nav-menu.staff")}</h3>
                  </Link>
                  <Link className="item" href="/division/privacy">
                    <h3>{t("Legacy.nav-menu.privacy")}</h3>
                  </Link>
                  <Link
                    className="item"
                    href="https://files.vatprc.net/VATPRC_2022_Logo_Pack_v1.0.zip"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex items-center gap-2">
                      {t("Legacy.nav-menu.logo-pack")}
                      <ExternalLink size={12} />
                    </div>
                  </Link>
                  <hr className="col-span-full" />
                  <Link
                    className="large-item"
                    href="https://community.vatprc.net"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex items-center gap-2">
                      {t("Legacy.nav-menu.forum")}
                      <ExternalLink size={12} />
                    </div>
                  </Link>
                  <Link
                    className="large-item"
                    href={
                      locale === "zh-cn"
                        ? "https://community.vatprc.net/c/events/66-category/66"
                        : "https://vatsim.net/events/"
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex items-center gap-2">
                      {t("Legacy.nav-menu.event")}
                      <ExternalLink size={12} />
                    </div>
                  </Link>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                {t("Legacy.nav-menu.operation")}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="nav-list-grid">
                  <Link
                    className="large-item row-span-4 flex items-end"
                    href="/airspace/fir"
                  >
                    {t("Legacy.nav-menu.fir")}
                  </Link>
                  <Link className="item" href="/airspace/rvsm">
                    {t("Legacy.nav-menu.rvsm")}
                  </Link>
                  <Link className="item" href="/airspace/station">
                    {t("Legacy.nav-menu.atc-positions-frequencies")}
                  </Link>
                  <Link className="item" href="/airspace/sop">
                    {t("Legacy.nav-menu.sop")}
                  </Link>
                  <Link className="item" href="/airspace/vfr">
                    {t("Legacy.nav-menu.vfr")}
                  </Link>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                {t("Legacy.nav-menu.pilot")}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="nav-list-grid">
                  <Link
                    className="large-item row-span-2 flex items-end"
                    href="/pilot/start-to-fly"
                  >
                    {t("Legacy.nav-menu.start-to-fly")}
                  </Link>
                  <Link className="item" href="/pilot/introduction-to-fly">
                    {t("Legacy.nav-menu.introduction-to-fly")}
                  </Link>
                  <Link className="item" href="/pilot/ts3">
                    {t("Legacy.nav-menu.ts3")}
                  </Link>
                  <hr className="col-span-full" />
                  <Link
                    className="large-item row-span-3 flex items-end"
                    href="/pilot/pilot-softwares"
                  >
                    {t("Legacy.nav-menu.pilot-softwares")}
                  </Link>
                  <Link
                    className="item flex items-center gap-2"
                    href="https://chartfox.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("Legacy.nav-menu.charts")}
                    <ExternalLink size={12} />
                  </Link>
                  <Link
                    className="item flex items-center gap-2"
                    href="https://vacdm.vatprc.net/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("Legacy.nav-menu.vacdm")}
                    <ExternalLink size={12} />
                  </Link>
                  <Link
                    className="item flex items-center gap-2"
                    href="https://metar-taf.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("Legacy.nav-menu.weather")}
                    <ExternalLink size={12} />
                  </Link>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                {t("Legacy.nav-menu.atc")}
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="nav-list-grid">
                  <Link
                    className="large-item row-span-3 flex items-end"
                    href="/controller/controller-list"
                  >
                    {t("Legacy.nav-menu.controller-list")}
                  </Link>
                  <Link
                    className="item"
                    href="/controller/controller-regulations"
                  >
                    {t("Legacy.nav-menu.controller-regulations")}
                  </Link>
                  <Link className="item" href="/controller/become-a-controller">
                    {t("Legacy.nav-menu.become-a-controller")}
                  </Link>
                  <Link
                    className="item"
                    href="/controller/visiting-and-transferring"
                  >
                    {t("Legacy.nav-menu.visiting-and-transferring")}
                  </Link>
                  <hr className="col-span-full" />
                  <Link
                    className="large-item row-span-3 flex items-end"
                    href="https://atc.vatprc.net"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex items-center gap-2">
                      {t("Legacy.nav-menu.atc-center")}
                      <ExternalLink size={12} />
                    </div>
                  </Link>
                  <Link
                    className="item flex items-center gap-2"
                    href="https://moodle.vatprc.net"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("Legacy.nav-menu.moodle")}
                    <ExternalLink size={12} />
                  </Link>
                  <Link className="item" href="/controller/sector">
                    {t("Legacy.nav-menu.sector")}
                  </Link>
                  <Link className="item" href="/controller/loa">
                    {t("Legacy.nav-menu.loa")}
                  </Link>
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
