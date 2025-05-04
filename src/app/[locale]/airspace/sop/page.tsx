import { DiscourseDocument } from "@/components/DiscourseDocument";
import { DocumentList } from "@/components/DocumentList";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { getAllDocuments } from "@/lib/docs";
import { PageProps } from "@/utils";
import { getTranslations, setRequestLocale } from "next-intl/server";

const Page = async ({ params }: PageProps<"locale">) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.airspace.sop");

  const documents = await getAllDocuments();

  return (
    <>
      {locale === "en" && (
        <Alert variant="destructive">
          <AlertTitle>{t("no-english")}</AlertTitle>
        </Alert>
      )}
      <h1 className="my-4 text-center text-3xl font-bold">{t("new")}</h1>
      <DocumentList
        documents={documents.filter(
          (doc) =>
            doc.webPath.startsWith("/docs/aerodromes") ||
            doc.webPath.startsWith("/docs/enroute") ||
            doc.webPath.startsWith("/docs/terminal_area"),
        )}
      />
      <hr />
      <h1 className="my-4 text-center text-3xl font-bold">{t("legacy")}</h1>
      <DiscourseDocument en="7532" />
    </>
  );
};

export default Page;
