import * as m from "@/lib/i18n/messages";
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

function RouteComponent() {
  // const { locale } = Route.useParams();
  // if (!["zh-cn", "en"].includes(locale)) {
  //   notFound({ throw: true });
  // }

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
