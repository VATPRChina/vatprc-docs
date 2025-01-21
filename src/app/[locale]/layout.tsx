import logo from "@/assets/logo_standard.svg";
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
import { useParams, usePathname } from "next/navigation";

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
    <header className="bg-slate-50 py-2 px-8 border-b-2 border-slate-300 sticky top-0 h-16 flex items-center z-50 w-full">
      <div className="flex items-center gap-8">
        <Link href="/">
          <Image src={logo} alt="VATPRC logo" height={32} className="-mt-2" />
        </Link>
        <Link href="/docs">
          <span className="font-bold">{t("menu.docs")}</span>
        </Link>
        <Link
          href="."
          locale={(await getLocale()) === "en" ? "zh-cn" : "en"}
          className="ml-auto"
        >
          <span>{t("menu.lang")}</span>
        </Link>
      </div>
    </header>
  );

  const footer = (
    <footer className="mt-8 mb-4">
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
      <body className="bg-slate-50 container mx-auto">
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
