import * as m from "@/lib/i18n/messages";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/$locale")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <header></header>
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
