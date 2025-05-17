import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
  head: () => ({
    meta: [
      { name: "robots", content: "noindex" },
      // { httpEquiv: "refresh", content: "2;url=/zh-cn/" },
    ],
  }),
});

function RouteComponent() {
  const navigate = useNavigate();
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
      void navigate({ to: "/$locale", params: { locale: "zh-cn" } });
    } else {
      void navigate({ to: "/$locale", params: { locale: "en" } });
    }
  });

  return (
    <div className="grid h-screen place-items-center">
      <div className="flex flex-col items-center gap-4">
        <p className="text-3xl">Redirecting to landing page.</p>
        <p className="text-3xl">正在重定向到首页。</p>
        <p className="flex flex-row gap-8 text-xl text-slate-700 underline">
          <Link to="/$locale" params={{ locale: "zh-cn" }}>
            简体中文
          </Link>
          <Link to="/$locale" params={{ locale: "en" }}>
            English
          </Link>
        </p>
      </div>
    </div>
  );
}
