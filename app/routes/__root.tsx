import "@/styles/rehype-github-callouts.css";
import {
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import "@mantine/core/styles.css";
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
        <MantineProvider>
          <Outlet />
        </MantineProvider>
        <Scripts />
      </body>
    </html>
  );
};

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { title: "VATSIM P.R. China Division" },
    ],
  }),
  component: RootLayout,
});
