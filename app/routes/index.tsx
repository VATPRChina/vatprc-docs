import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
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
