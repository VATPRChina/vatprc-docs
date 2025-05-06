import { DiscourseDocument } from "@/components/DiscourseDocument";
import { generateDiscourseMetadata } from "@/components/DiscourseDocument.server";
import { PageProps } from "@/utils";

export const generateMetadata = generateDiscourseMetadata("7164", "7212");

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="7164" en="7212" />;
};

export default Page;
