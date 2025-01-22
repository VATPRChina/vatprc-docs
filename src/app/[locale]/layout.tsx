import logo from "@/assets/logo_standard.svg";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { Link, routing } from "@/i18n/routing";
import "@/styles/globals.css";
import "@/styles/rehype-github-callouts.css";
import { PageProps } from "@/utils";
import { NextIntlClientProvider } from "next-intl";
import {
  getLocale,
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import Image from "next/image";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const RootLayout = async ({
  children,
  params,
}: PageProps<"locale"> & { children: React.ReactNode }) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "Layout" });

  const header = (
    <header className="sticky top-0 z-50 flex h-16 w-full items-center border-b-2 border-slate-300 bg-slate-50 px-8 py-2">
      <div className="flex items-center gap-8">
        <Link href="/">
          <Image src={logo} alt="VATPRC logo" height={32} className="-mt-2" />
        </Link>
        <Link href="/docs">
          <span className="font-bold">{t("menu.docs")}</span>
        </Link>
        <LanguageSwitch locale={await getLocale()} />
      </div>
    </header>
  );

  const footer = (
    <footer className="mb-4 mt-8">
      <p className="text-slate-500">
        &copy;{" "}
        {t.rich("copyright", {
          next: (chunks) => (
            <a href="https://nextjs.org" className="underline">
              {chunks}
            </a>
          ),
          tw: (chunks) => (
            <a href="https://tailwindcss.com" className="underline">
              {chunks}
            </a>
          ),
        })}
      </p>
    </footer>
  );

  return (
    <html lang={locale} className="scroll-pt-16">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="container mx-auto bg-slate-50">
        <NextIntlClientProvider messages={messages} locale={locale}>
          {header}
          <div className="pt-4">{children}</div>
          {footer}
        </NextIntlClientProvider>
      </body>
    </html>
  );
};
export default RootLayout;
