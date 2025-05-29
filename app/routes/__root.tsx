import stylesheetUrl from "./__root.css?url";
import logo from "@/assets/logo_standard.svg";
import logoWhite from "@/assets/logo_standard_white.svg";
import { ColorSchemeToggle } from "@/components/ColorSchemeToggle";
import { RouteButton } from "@/components/route/Button";
import { m } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/runtime";
import { getPathname } from "@/lib/util";
import rehypeCssUrl from "@/styles/rehype-github-callouts.css?url";
import {
  ActionIcon,
  AppShell,
  Burger,
  ColorSchemeScript,
  Container,
  Group,
  Text,
  Image,
  mantineHtmlProps,
  MantineProvider,
  useComputedColorScheme,
  Button,
  HoverCard,
  Stack,
  SimpleGrid,
  Divider,
  Box,
  ButtonProps,
  Accordion,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { useState } from "react";
import { TbExternalLink, TbLanguage } from "react-icons/tb";

interface NavMenuProps {
  isMobile?: boolean;
}
const NavMenu: React.FC<NavMenuProps> = ({ isMobile }: NavMenuProps) => {
  const lgProps = {
    variant: "default",
    h: "100%",
    justify: "left",
  } as const satisfies ButtonProps;
  const smProps = {
    variant: "default",
    justify: "left",
    bd: "none",
  } as const satisfies ButtonProps;
  const extProps = {
    component: "a",
    target: "_blank",
    rel: "noopener noreferrer",
  } as const;
  const contents = [
    {
      title: m["Legacy_nav-menu_about"](),
      content: (
        <>
          <SimpleGrid cols={2}>
            <RouteButton to="/division/introduction" {...lgProps}>
              {m["Legacy_nav-menu_announcement"]()}
              <TbExternalLink size={12} />
            </RouteButton>
            <Stack gap="xs">
              <RouteButton to="/division/staff" {...smProps}>
                {m["Legacy_nav-menu_staff"]()}
              </RouteButton>
              <RouteButton to="/division/privacy" {...smProps}>
                {m["Legacy_nav-menu_privacy"]()}
              </RouteButton>
            </Stack>
          </SimpleGrid>
          <Divider my="sm" />
          <SimpleGrid cols={2}>
            <Button href="https://community.vatprc.net" {...extProps} {...smProps}>
              {m["Legacy_nav-menu_forum"]()}
              <TbExternalLink size={12} />
            </Button>
            <Button
              href={
                getLocale() === "zh-cn"
                  ? "https://community.vatprc.net/c/events/66-category/66"
                  : "https://vatsim.net/events/"
              }
              {...smProps}
              {...extProps}
            >
              {m["Legacy_nav-menu_event"]()}
              <TbExternalLink size={12} />
            </Button>
          </SimpleGrid>
        </>
      ),
    },
    {
      title: m["Legacy_nav-menu_operation"](),
      content: (
        <>
          <SimpleGrid cols={2}>
            <RouteButton to="/airspace/fir" {...lgProps}>
              {m["Legacy_nav-menu_fir"]()}
            </RouteButton>
            <Stack gap="xs">
              <RouteButton to="/division/introduction" {...smProps}>
                {m["Legacy_nav-menu_introduction"]()}
              </RouteButton>
              <RouteButton to="/airspace/rvsm" {...smProps}>
                {m["Legacy_nav-menu_rvsm"]()}
              </RouteButton>
              <RouteButton to="/airspace/station" {...smProps}>
                {m["Legacy_nav-menu_atc-positions-frequencies"]()}
              </RouteButton>
              <RouteButton to="/airspace/sop" {...smProps}>
                {m["Legacy_nav-menu_sop"]()}
              </RouteButton>
              <RouteButton to="/airspace/vfr" {...smProps}>
                {m["Legacy_nav-menu_vfr"]()}
              </RouteButton>
            </Stack>
          </SimpleGrid>
        </>
      ),
    },
    {
      title: m["Legacy_nav-menu_pilot"](),
      content: (
        <>
          <SimpleGrid cols={2}>
            <RouteButton to="/pilot/start-to-fly" {...lgProps}>
              {m["Legacy_nav-menu_start-to-fly"]()}
            </RouteButton>
            <Stack gap="xs">
              <RouteButton to="/pilot/introduction-to-fly" {...smProps}>
                {m["Legacy_nav-menu_introduction-to-fly"]()}
              </RouteButton>
              <RouteButton to="/pilot/ts3" {...smProps}>
                {m["Legacy_nav-menu_ts3"]()}
              </RouteButton>
            </Stack>
          </SimpleGrid>
          <Divider my="sm" />
          <SimpleGrid cols={2}>
            <RouteButton to="/pilot/pilot-softwares" {...lgProps}>
              {m["Legacy_nav-menu_pilot-softwares"]()}
            </RouteButton>
            <Stack gap="xs">
              <Button href="https://chartfox.org/" {...extProps} {...smProps}>
                {m["Legacy_nav-menu_charts"]()}
                <TbExternalLink size={12} />
              </Button>
              <Button href="https://vacdm.vatprc.net/" {...extProps} {...smProps}>
                {m["Legacy_nav-menu_vacdm"]()}
                <TbExternalLink size={12} />
              </Button>
              <Button href="https://metar-taf.com/" {...extProps} {...smProps}>
                {m["Legacy_nav-menu_weather"]()}
                <TbExternalLink size={12} />
              </Button>
            </Stack>
          </SimpleGrid>
        </>
      ),
    },
    {
      title: m["Legacy_nav-menu_atc"](),
      content: (
        <>
          <SimpleGrid cols={2}>
            <RouteButton to="/controller/controller-list" {...lgProps}>
              {m["Legacy_nav-menu_controller-list"]()}
            </RouteButton>
            <Stack gap="xs">
              <RouteButton to="/controller/controller-regulations" {...smProps}>
                {m["Legacy_nav-menu_controller-regulations"]()}
              </RouteButton>
              <RouteButton to="/controller/become-a-controller" {...smProps}>
                {m["Legacy_nav-menu_become-a-controller"]()}
              </RouteButton>
              <RouteButton to="/controller/visiting-and-transferring" {...smProps}>
                {m["Legacy_nav-menu_visiting-and-transferring"]()}
              </RouteButton>
            </Stack>
          </SimpleGrid>
          <Divider my="sm" />
          <SimpleGrid cols={2}>
            <Button href="https://atc.vatprc.net" {...extProps} {...lgProps}>
              {m["Legacy_nav-menu_atc-center"]()}
              <TbExternalLink size={12} />
            </Button>
            <Stack gap="xs">
              <Button href="https://moodle.vatprc.net" {...extProps} {...smProps}>
                {m["Legacy_nav-menu_moodle"]()}
                <TbExternalLink size={12} />
              </Button>
              <RouteButton to="/controller/sector" {...smProps}>
                {m["Legacy_nav-menu_sector"]()}
              </RouteButton>
              <RouteButton to="/controller/loa" {...smProps}>
                {m["Legacy_nav-menu_loa"]()}
              </RouteButton>
            </Stack>
          </SimpleGrid>
        </>
      ),
    },
  ];

  if (isMobile) {
    return (
      <Accordion defaultValue={contents[0].title}>
        {contents.map((content) => (
          <Accordion.Item key={content.title} value={content.title}>
            <Accordion.Control>{content.title}</Accordion.Control>
            <Accordion.Panel>{content.content}</Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    );
  }
  return contents.map((content) => (
    <HoverCard key={content.title} width="max-content" shadow="md">
      <HoverCard.Target>
        <Button variant="default" bd="none">
          {content.title}
        </Button>
      </HoverCard.Target>
      <HoverCard.Dropdown w={500}>{content.content}</HoverCard.Dropdown>
    </HoverCard>
  ));
};

interface ApplicationProps {
  children?: React.ReactNode;
}

const Application: React.FC<ApplicationProps> = ({ children }: ApplicationProps) => {
  const computedColorScheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const [opened, { toggle }] = useDisclosure();

  return (
    <Container size={1440}>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { desktop: true, mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header
          style={{
            maxWidth: "calc(90rem * var(--mantine-scale))",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          <Group h="100%" px="md">
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Group justify="space-between" style={{ flex: 1 }}>
              <Group>
                <RouteButton to="/" variant="transparent">
                  <Image
                    src={computedColorScheme === "light" ? logo : logoWhite}
                    alt={m.Legacy_title()}
                    h={24}
                    w="auto"
                  />
                </RouteButton>
                <Group gap={0} visibleFrom="sm">
                  <NavMenu />
                </Group>
              </Group>
              <Group>
                <ColorSchemeToggle />
                <ActionIcon
                  variant="subtle"
                  c="gray"
                  component="a"
                  href={getPathname().replace(getLocale(), getLocale() === "zh-cn" ? "en" : "zh-cn")}
                >
                  <TbLanguage width="70%" height="70%" />
                </ActionIcon>
              </Group>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar py="md" px={4} hiddenFrom="sm" h="100%">
          <NavMenu isMobile />
        </AppShell.Navbar>

        <AppShell.Main>
          {children}
          <Box component="footer" mt="md">
            <Text c="gray.5">&copy; {m.Layout_copyright()}</Text>
          </Box>
        </AppShell.Main>
      </AppShell>
    </Container>
  );
};

const RootLayout: React.FC = () => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000,
          },
        },
      }),
  );

  return (
    <html lang={getLocale() ?? "en"} {...mantineHtmlProps}>
      <head>
        <HeadContent />
        <ColorSchemeScript />
      </head>
      <body>
        <MantineProvider defaultColorScheme="auto">
          <QueryClientProvider client={queryClient}>
            <Application>
              <Outlet />
            </Application>
          </QueryClientProvider>
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
    links: [
      { rel: "stylesheet", href: stylesheetUrl },
      { rel: "stylesheet", href: rehypeCssUrl },
    ],
  }),
  component: RootLayout,
});
