import "@/styles/globals.css";
import "@/styles/rehype-github-callouts.css";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";

const RootLayout: React.FC = () => {
  return (
    <html className="scroll-pt-16">
      <head>
        {/* <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="refresh" content="2;url=/zh-cn/" />
        <meta name="robots" content="noindex" />
        <link rel="canonical" href="/zh-cn/" />
        <title>VATSIM P.R. China Division</title> */}
        <HeadContent />
      </head>
      <body className="container mx-auto bg-slate-50">
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1.0",
      },
      {
        name: "robots",
        content: "noindex",
      },
      {
        httpEquiv: "refresh",
        content: "2;url=/zh-cn/",
      },
      {
        title: "VATSIM P.R. China Division",
      },
    ],
  }),
  component: RootLayout,
});
