import { DiscourseDocument } from "@/components/DiscourseDocument";
import { generateDiscourseMetadata } from "@/components/DiscourseDocument.server";
import { PageProps } from "@/utils";

export const generateMetadata = generateDiscourseMetadata("7187", "7213");

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="7187" en="7213" />;
};

export default Page;
