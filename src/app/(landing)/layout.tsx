import { routing } from "@/i18n/routing";
import "@/styles/globals.css";
import "@/styles/rehype-github-callouts.css";
import Link from "next/link";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const RootLayout = async ({ children }: { children: React.ReactNode }) => {
  return (
    <html className="scroll-pt-16">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="refresh" content="2;url=/zh-cn/" />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="/zh-cn/" />
        <title>VATSIM P.R. China Division</title>
      </head>
      <body className="container mx-auto bg-slate-50">
        <div className="grid h-screen place-items-center">
          <div className="flex flex-col items-center gap-4">
            <p className="text-3xl">Redirecting to landing page.</p>
            <p className="text-3xl">正在重定向到首页。</p>
            <p className="flex flex-row gap-8 text-xl text-slate-700 underline">
              <Link href="/zh-cn">简体中文</Link>
              <Link href="/en">English</Link>
            </p>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
};
export default RootLayout;
