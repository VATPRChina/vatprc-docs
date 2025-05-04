import { LanguageSwitch } from "./LanguageSwitch";
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
import { useTranslations } from "next-intl";
import Image from "next/image";
import React from "react";

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className,
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

export const Header: React.FC = () => {
  const t = useTranslations();

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
                  ></ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            {/* <NavigationMenuItem>
              <NavigationMenuTrigger>Components</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  <ListItem
                    key={component.title}
                    title={component.title}
                    href={component.href}
                  >
                    {component.description}
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem> */}
          </NavigationMenuList>
        </NavigationMenu>
        <LanguageSwitch className="ml-auto hover:text-vatprc dark:text-white">
          <Languages size={18} />
        </LanguageSwitch>
      </div>
    </header>
  );
};
