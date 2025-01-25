import { LanguageSwitch } from "./LanguageSwitch";
import logo from "@/assets/logo_standard.svg";
import logoWhite from "@/assets/logo_standard_white.svg";
import { Link } from "@/i18n/routing";
import { LanguageIcon } from "@heroicons/react/24/outline";
import { useTranslations } from "next-intl";
import Image from "next/image";

export const Header: React.FC = () => {
  const t = useTranslations();

  return (
    <header className="sticky top-0 z-50 w-full border-b-[1px] border-slate-300 bg-white px-8 py-2 dark:border-slate-700 dark:bg-black">
      <div className="items-top flex gap-4">
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
        {/* <div className="flex flex-col gap-2">
          <span className="text-bold">{t("Legacy.nav-menu.announcement")}</span>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-bold">{t("Legacy.nav-menu.about")}</span>
          <span className="text-bold">{t("Legacy.nav-menu.introduction")}</span>
          <span className="text-bold">{t("Legacy.nav-menu.staff")}</span>
          <span className="text-bold">{t("Legacy.nav-menu.privacy")}</span>
          <span className="text-bold">{t("Legacy.nav-menu.logo-pack")}</span>
        </div> */}
        <LanguageSwitch className="hover:text-vatprc dark:text-white">
          <LanguageIcon height={16} />
        </LanguageSwitch>
      </div>
      {/* <div className="grid w-full auto-cols-min grid-flow-col auto-rows-min items-center justify-start justify-items-center gap-2">
        <div className="contents">
          <div className="col-[1] row-[1] h-16 w-24 bg-red-300"></div>
        </div>
        <div className="contents">
          <div className="col-[2] row-[1] h-4 w-8 bg-orange-300"></div>
          <div className="col-[2] h-4 w-16 bg-yellow-300"></div>
          <div className="col-[2] h-4 w-12 bg-green-300"></div>
        </div>
        <div className="contents">
          <div className="col-[3] row-[1] h-4 w-16 bg-cyan-300"></div>
          <div className="w-18 col-[3] h-4 bg-blue-300"></div>
        </div>
        <div className="contents">
          <div className="col-[4] row-[1] h-4 w-12 bg-purple-300"></div>
          <div className="col-[4] h-4 w-16 bg-red-300"></div>
          <div className="col-[4] h-4 w-8 bg-orange-300"></div>
        </div>
      </div> */}
    </header>
  );
};
