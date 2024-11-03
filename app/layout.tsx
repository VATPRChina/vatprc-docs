import Image from "next/image";
import Link from "next/link";
import "../styles/globals.css";
import logo from "../assets/logo_standard.svg";
import "../styles/rehype-github-callouts.css";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const header = (
    <header className="py-2 px-8 border-b-2 border-slate-300 sticky top-0 bg-white rounded-full h-16 flex items-center">
      <div className="flex items-center gap-8">
        <Link href="/">
          <Image src={logo} alt="VATPRC logo" height={32} className="-mt-2" />
        </Link>
        <Link href="/docs">
          <span className="font-bold">Docs</span>
        </Link>
        <span>仅供模拟飞行使用，严禁用于真实运行。</span>
      </div>
    </header>
  );

  const footer = (
    <footer className="mt-8">
      <p className="text-slate-500">
        &copy; 2010 - 2024, VATSIM P.R. China Division. All rights reserved.
        Powered by Next.js.
      </p>
    </footer>
  );

  return (
    <html className="scroll-pt-16">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="bg-slate-50 container mx-auto">
        {header}
        <div className="pt-4">{children}</div>
        {footer}
      </body>
    </html>
  );
}
