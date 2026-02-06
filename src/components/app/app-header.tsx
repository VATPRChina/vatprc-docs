import { NavMenu, NavMenuDrawer } from "./app-nav-menu";
import { LanguageToggle } from "./language-toggle";
import { ModeToggle } from "./theme-toggle";
import { UserInfo } from "./user-info";
import logoWhite from "@/assets/logo_standard_white.svg";
import logo from "@/assets/standard_2026.png";
import { useLingui } from "@lingui/react/macro";
import { ActionIcon, Paper } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Link } from "@tanstack/react-router";
import { TbMenu2 } from "react-icons/tb";

export const AppHeader: React.FC = () => {
  const { t } = useLingui();
  const [opened, { open, close }] = useDisclosure();

  return (
    <Paper className="sticky top-0 z-50 w-full border-b px-8 py-2">
      <div className="container mx-auto flex flex-row items-center gap-4">
        <Link to="/">
          <img src={logo} alt={t`VATSIM P.R.China Division`} className="h-6 not-dark:block dark:hidden" />
          <img src={logoWhite} alt={t`VATSIM P.R.China Division`} className="h-6 not-dark:hidden dark:block" />
        </Link>
        <div className="hidden lg:contents">
          <NavMenu />
          <div className="ml-auto flex flex-row items-center gap-4">
            <ModeToggle />
            <LanguageToggle />
            <UserInfo />
          </div>
        </div>
        <div className="contents lg:hidden">
          <ActionIcon variant="subtle" onClick={open} className="ml-auto">
            <TbMenu2 />
          </ActionIcon>
          <NavMenuDrawer opened={opened} onClose={close} />
        </div>
      </div>
    </Paper>
  );
};
