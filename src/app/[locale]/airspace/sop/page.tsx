import { DiscourseDocument } from "@/components/DiscourseDocument";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { PageProps } from "@/utils";
import { getTranslations, setRequestLocale } from "next-intl/server";

const Page = async ({ params }: PageProps<"locale">) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("pages.airspace.sop");

  return (
    <>
      {locale === "en" && (
        <Alert variant="destructive">
          <AlertTitle>{t("no-english")}</AlertTitle>
        </Alert>
      )}
      <DiscourseDocument en="7532" />
    </>
  );
};

export default Page;
