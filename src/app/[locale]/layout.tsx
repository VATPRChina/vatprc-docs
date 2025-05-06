import { Header } from "@/components/Header";
import { routing } from "@/i18n/routing";
import "@/styles/globals.css";
import "@/styles/rehype-github-callouts.css";
import { PageProps } from "@/utils";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";

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
  const t = await getTranslations({ locale });

  const footer = (
    <footer className="mb-4 mt-8">
      <p className="text-slate-500 dark:text-slate-300">
        &copy;{" "}
        {t.rich("Layout.copyright", {
          next: (chunks) => (
            <a
              href="https://nextjs.org"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {chunks}
            </a>
          ),
          tw: (chunks) => (
            <a
              href="https://tailwindcss.com"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {chunks}
            </a>
          ),
          azure: (chunks) => (
            <a
              href="https://azure.microsoft.com"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
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
        <title>{t("Legacy.title")}</title>
      </head>
      <body className="container mx-auto dark:bg-black">
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Header />
          <div className="pt-4">{children}</div>
          {footer}
        </NextIntlClientProvider>
      </body>
    </html>
  );
};
export default RootLayout;
