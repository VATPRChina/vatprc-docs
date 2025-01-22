import { routing } from "@/i18n/routing";
import "@/styles/globals.css";
import "@/styles/rehype-github-callouts.css";

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
      </head>
      <body className="bg-slate-50 container mx-auto">
        <div className="grid h-screen place-items-center">
          <div className="flex flex-col gap-4 items-center">
            <p className="text-3xl">Redirecting to landing page.</p>
            <p className="text-3xl">正在重定向到首页。</p>
            <p className="text-xl text-slate-700 flex flex-row gap-8 underline">
              <a href="/zh-cn">简体中文</a>
              <a href="/en">English</a>
            </p>
          </div>
        </div>
        {children}
      </body>
    </html>
  );
};
export default RootLayout;
