import drone from "@/assets/legacy/drone.png";
import feedback from "@/assets/legacy/feedback.png";
import laptop from "@/assets/legacy/lap_top.png";
import pilot from "@/assets/legacy/pilot.png";
import { OnlineControllers } from "@/components/OnlineControllers";
import { OnlinePilots } from "@/components/OnlinePilots";
import { RecentEvents } from "@/components/RecentEvents";
import { m } from "@/lib/i18n/messages";
import { getPathname } from "@/lib/util";
import { Anchor, Text, Group, Image, SimpleGrid, Stack, Title, Button } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { TbMail } from "react-icons/tb";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  head: () => ({
    meta: [{ name: "robots", content: "noindex" }],
  }),
});

const IndexWithLocale: React.FC = () => {
  // @ts-expect-error Allow any
  // eslint-disable-next-line
  const t = (s: string) => m["Legacy_" + s.replaceAll(".", "_")]();

  return (
    <Stack gap="xl">
      <SimpleGrid cols={{ base: 1, md: 2 }}>
        <Stack justify="center">
          <Title order={1} style={{ textAlign: "center" }}>
            {m["Legacy_title"]()}
          </Title>
          <Title order={2} style={{ textAlign: "center" }}>
            {m["Legacy_subtitle"]()}
          </Title>
        </Stack>
        <Image src={pilot} alt="Pilot" width="100%" height="100%" />
      </SimpleGrid>
      <Stack align="center">
        <Title order={2}>{t("recent-events")}</Title>
        <RecentEvents />
      </Stack>
      <SimpleGrid cols={{ base: 1, md: 2 }} style={{ justifyItems: "center", alignItems: "center" }}>
        <Image src={laptop} alt="laptop" w={512} maw="50%" />
        <Stack align="center">
          <Title order={2}>{m["Legacy_online-controllers"]()}</Title>
          <OnlineControllers />
        </Stack>
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, md: 2 }} style={{ justifyItems: "center", alignItems: "center" }}>
        <Stack align="center">
          <Title order={2}>{m["Legacy_online-pilots"]()}</Title>
          <OnlinePilots />
        </Stack>
        <Image src={drone} alt="drone" w={512} maw="50%" />
      </SimpleGrid>
      <SimpleGrid cols={{ base: 1, md: 2 }} style={{ justifyItems: "center", alignItems: "center" }}>
        <Image src={feedback} alt="feedback" w={512} maw="50%" />
        <Stack align="center">
          <Title order={2}>{m["Legacy_feedback"]()}</Title>
          <Text>{m["Legacy_feedback-description"]()}</Text>
          <Button
            variant="subtle"
            color="red"
            component="a"
            href="mailto:feedback@vatprc.net"
            target="_blank"
            rel="noopener noreferrer"
            leftSection={<TbMail />}
          >
            feedback@vatprc.net
          </Button>
          <Button
            variant="subtle"
            color="red"
            component="a"
            href="https://community.vatprc.net"
            target="_blank"
            rel="noopener noreferrer"
          >
            {m["Legacy_nav-menu_forum"]()}
          </Button>
        </Stack>
      </SimpleGrid>
      <Stack style={{ textAlign: "center", fontStyle: "italic" }} c="red.9">
        <Title order={2}>VATPRC 有你更精彩</Title>
        <Title order={2}>You make the difference!</Title>
      </Stack>
    </Stack>
  );
};

const IndexWithoutLocale: React.FC = () => {
  useEffect(() => {
    let useChinese = false;
    if (navigator.language.toLowerCase().startsWith("zh")) {
      useChinese = true;
    }
    for (const language of navigator.languages) {
      if (language.toLowerCase().startsWith("en")) {
        break;
      } else if (language.toLowerCase().startsWith("zh")) {
        useChinese = true;
        break;
      }
    }
    if (useChinese) {
      window.location.replace("/zh-cn");
    } else {
      window.location.replace("/en");
    }
  });

  return (
    <div>
      <div>
        <p>Redirecting to landing page.</p>
        <p>正在重定向到首页。</p>
        <Group>
          <Anchor href="/zh-cn">简体中文</Anchor>
          <Anchor href="/en">English</Anchor>
        </Group>
      </div>
    </div>
  );
};

function RouteComponent() {
  if (getPathname().startsWith("/en") || getPathname().startsWith("/zh-cn")) {
    return <IndexWithLocale />;
  }
  return <IndexWithoutLocale />;
}
