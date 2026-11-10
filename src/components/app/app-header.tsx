import { NavMenu, NavMenuDrawer } from "./app-nav-menu";
import { LanguageToggle } from "./language-toggle";
import { ModeToggle } from "./theme-toggle";
import { UserInfo } from "./user-info";
import logo from "@/assets/logo_standard.svg";
import logoWhite from "@/assets/logo_standard_white.svg";
import { cn } from "@/lib/utils";
import { useLingui } from "@lingui/react/macro";
import { ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { TbMenu2 } from "react-icons/tb";

export const AppHeader = ({ overlayHero = false }: { overlayHero?: boolean }) => {
  const { t } = useLingui();
  const [opened, { open, close }] = useDisclosure();
  const headerRef = useRef<HTMLElement>(null);
  const [overHero, setOverHero] = useState(overlayHero);
  const transparent = overlayHero && overHero;

  useEffect(() => {
    if (!overlayHero) return;
    const header = headerRef.current;
    const hero = document.querySelector("[data-homepage-hero]");
    if (!header || !hero) return;

    let observer: IntersectionObserver;
    const observe = () => {
      observer?.disconnect();
      const height = header.getBoundingClientRect().height;
      setOverHero(hero.getBoundingClientRect().bottom > height);
      observer = new IntersectionObserver(([entry]) => setOverHero(entry.isIntersecting), {
        rootMargin: `-${height}px 0px 0px 0px`,
      });
      observer.observe(hero);
    };
    observe();
    const resizeObserver = new ResizeObserver(observe);
    resizeObserver.observe(header);
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
    };
  }, [overlayHero]);

  return (
    <header
      ref={headerRef}
      data-over-hero={transparent || undefined}
      className={cn(
        "app-header sticky top-0 z-50 w-full border-b px-4 py-2 transition-colors duration-200 sm:px-8",
        overlayHero && "col-start-1 row-start-1 self-start",
        transparent ? "border-transparent bg-transparent" : "bg-white dark:bg-gray-950",
      )}
    >
      <div className="app-header-controls container mx-auto flex flex-row items-center gap-4">
        <Link to="/">
          <img
            src={logo}
            alt={t`VATSIM P.R.China Division`}
            className={cn("h-6 dark:hidden", transparent && "hidden")}
          />
          <img
            src={logoWhite}
            alt={t`VATSIM P.R.China Division`}
            className={cn("h-6 dark:block", !transparent && "hidden")}
          />
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
          <ActionIcon
            variant="subtle"
            onClick={open}
            className="ml-auto"
            aria-label={t`Open navigation`}
            aria-expanded={opened}
            aria-haspopup="dialog"
          >
            <TbMenu2 />
          </ActionIcon>
        </div>
        <NavMenuDrawer
          opened={opened}
          onClose={close}
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
