import { NavMenu, NavMenuDrawer } from "./app-nav-menu";
import { LanguageToggle } from "./language-toggle";
import { ModeToggle } from "./theme-toggle";
import { UserInfo } from "./user-info";
import logo from "@/assets/logo_standard.svg";
import logoWhite from "@/assets/logo_standard_white.svg";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useLingui } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";
import { useState as useDisclosureState } from "react";
import { useEffect, useRef, useState } from "react";
import { TbMenu2 } from "react-icons/tb";

export const AppHeader = ({ overlayHero = false }: { overlayHero?: boolean }) => {
  const { t } = useLingui();
  const [opened, setOpened] = useDisclosureState(false);
  const open = () => setOpened(true);
  const close = () => setOpened(false);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b px-4 py-2 transition-colors duration-200 sm:px-8",
        overlayHero && "col-start-1 row-start-1 self-start",
        "bg-white dark:bg-gray-950",
      )}
    >
      <div className="container mx-auto flex flex-row items-center gap-4">
        <Link to="/">
          <img src={logo} alt={t`VATSIM P.R.China Division`} className="block h-6 dark:hidden" />
          <img src={logoWhite} alt={t`VATSIM P.R.China Division`} className="hidden h-6 dark:block" />
        </Link>
        <div className="hidden lg:contents">
          <NavMenu />
          <div className="ml-auto flex flex-row items-center gap-1">
            <ModeToggle />
            <LanguageToggle />
            <UserInfo />
          </div>
        </div>
        <div className="contents lg:hidden">
          <Button
            onClick={open}
            className="ml-auto"
            aria-label={t`Open navigation`}
            aria-expanded={opened}
            aria-haspopup="dialog"
            size={"icon-sm"}
            variant={"neutral"}
          >
            <TbMenu2 />
          </Button>
        </div>
        <NavMenuDrawer
          open={opened}
          onOpenChange={setOpened}
          onClick={(event) => {
            if (event.target instanceof Element && event.target.closest("a")) {
              close();
            }
          }}
        />
      </div>
    </header>
  );
};
