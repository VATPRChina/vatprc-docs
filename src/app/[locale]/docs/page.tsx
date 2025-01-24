import { DocumentList } from "@/components/DocumentList";
import { getAllDocuments } from "@/lib/docs";
import { PageProps } from "@/utils";
import { setRequestLocale } from "next-intl/server";

const HomePage = async ({ params }: PageProps<"locale">) => {
  const { locale } = await params;
  setRequestLocale(locale);

  const documents = await getAllDocuments();
  return <DocumentList documents={documents} />;
};

export default HomePage;
