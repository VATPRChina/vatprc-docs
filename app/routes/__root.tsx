import stylesheetUrl from "./__root.css?url";
import rehypeCssUrl from "@/styles/rehype-github-callouts.css?url";
import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
  useParams,
} from "@tanstack/react-router";

const RootLayout: React.FC = () => {
  const params = useParams({ strict: false });

  return (
    <MantineProvider defaultColorScheme="auto">
      <html
        className="scroll-pt-16"
        lang={params.locale ?? "en"}
        {...mantineHtmlProps}
      >
        <head>
          <HeadContent />
          <ColorSchemeScript />
        </head>
        <body className="container mx-auto bg-slate-50">
          <Outlet />
          <Scripts />
        </body>
      </html>
    </MantineProvider>
  );
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "VATSIM P.R. China Division" },
    ],
    links: [
      { rel: "stylesheet", href: stylesheetUrl },
      { rel: "stylesheet", href: rehypeCssUrl },
    ],
  }),
  component: RootLayout,
});
