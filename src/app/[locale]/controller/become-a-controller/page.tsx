import { DiscourseDocument } from "@/components/DiscourseDocument";
import { generateDiscourseMetadata } from "@/components/DiscourseDocument.server";
import { PageProps } from "@/utils";

export const generateMetadata = generateDiscourseMetadata("7188", "7214");

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="7188" en="7214" />;
};

export default Page;
