import logo from "@/assets/logo_standard.svg";
import logoWhite from "@/assets/logo_standard_white.svg";
import * as m from "@/lib/i18n/messages";
import {
  AppShell,
  Group,
  Burger,
  Button,
  Image,
  ActionIcon,
  Container,
  useMantineColorScheme,
  useComputedColorScheme,
} from "@mantine/core";
import { useColorScheme, useDisclosure } from "@mantine/hooks";
import {
  IconLanguage,
  IconMobiledata,
  IconMoon,
  IconSun,
  IconSunMoon,
} from "@tabler/icons-react";
import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/$locale")({
  component: RouteComponent,
  loader(ctx) {
    const { params } = ctx;
    if (!["zh-cn", "en"].includes(params.locale)) {
      notFound({ throw: true });
    }
  },
});

const Header: React.FC = () => {
  const computedColorScheme = useComputedColorScheme("light");
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [opened, { toggle }] = useDisclosure();

  return (
    <Container>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: 300,
          breakpoint: "sm",
          collapsed: { desktop: true, mobile: !opened },
        }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
            />
            <Group justify="space-between" style={{ flex: 1 }}>
              <Group>
                <Image
                  src={computedColorScheme === "light" ? logo : logoWhite}
                  alt={m.Legacy_title()}
                  h={24}
                  w="auto"
                />
                <Group gap={0} visibleFrom="sm">
                  <Button variant="subtle">Home</Button>
                  <Button variant="subtle">Blog</Button>
                  <Button variant="subtle">Contacts</Button>
                  <Button variant="subtle">Support</Button>
                </Group>
              </Group>
              <Group>
                <ActionIcon
                  variant="subtle"
                  c="gray"
                  onClick={() => {
                    toggleColorScheme();
                  }}
                >
                  {colorScheme === "auto" ? (
                    <IconSunMoon width="70%" height="70%" />
                  ) : colorScheme === "light" ? (
                    <IconSun width="70%" height="70%" />
                  ) : (
                    <IconMoon width="70%" height="70%" />
                  )}
                </ActionIcon>
                <ActionIcon variant="subtle" c="gray">
                  <IconLanguage width="70%" height="70%" />
                </ActionIcon>
              </Group>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar py="md" px={4}>
          <Button>Home</Button>
          <Button>Blog</Button>
          <Button>Contacts</Button>
          <Button>Support</Button>
        </AppShell.Navbar>

        <AppShell.Main>
          Navbar is only visible on mobile, links that are rendered in the
          header on desktop are hidden on mobile in header and rendered in
          navbar instead.
        </AppShell.Main>
      </AppShell>
    </Container>
  );
};

function RouteComponent() {
  return (
    <>
      <header>
        <Header />
      </header>
      <div className="pt-4">
        <Outlet />
      </div>
      <footer className="mt-8 mb-4">
        <p className="text-slate-500 dark:text-slate-300">
          &copy; {m.Layout_copyright()}
        </p>
      </footer>
    </>
  );
}
