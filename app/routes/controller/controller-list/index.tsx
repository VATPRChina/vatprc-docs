import { DiscourseDocument } from "@/components/DiscourseDocument";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controller/controller-list/")({
  component: Page,
});

function Page() {
  // const { locale } = await params;
  // setRequestLocale(locale);
  // const t = await getTranslations("Legacy");

  return (
    <div>
      {/* <div className="prose min-w-full dark:prose-invert">
        <h2>{t("nav-menu.controller-list")}</h2>
        <p>{t("controller-list.description")}</p>
        <ul>
          <li>
            <b>✘</b> {t("controller-list.permission-restricted")}
          </li>
          <li>
            <b>T</b> {t("controller-list.permission-training")}
          </li>
          <li>
            <b>S</b> {t("controller-list.permission-solo")}
          </li>
          <li>
            <b>✓</b> {t("controller-list.permission-full")}
          </li>
          <li>
            <b>V</b> {t("controller-list.marker-visiting")}
          </li>
        </ul>
        <p>{t("controller-list.ptwr-description")}</p>
      </div>
      <ControllerList /> */}
    </div>
  );
}

export default Page;
