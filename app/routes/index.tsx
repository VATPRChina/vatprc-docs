import { m } from "@/lib/i18n/messages";
import { getPathname } from "@/lib/util";
import { Anchor, Group } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  head: () => ({
    meta: [{ name: "robots", content: "noindex" }],
  }),
});

const IndexWithLocale: React.FC = () => {
  return <div>{m.Legacy_button_about()}</div>;
};

const Index: React.FC = () => {
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
  return <Index />;
}
