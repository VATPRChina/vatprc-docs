import { DiscourseDocument } from "@/components/DiscourseDocument";
import { generateDiscourseMetadata } from "@/components/DiscourseDocument.server";
import { PageProps } from "@/utils";

export const generateMetadata = generateDiscourseMetadata("7166", "7204");

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="7166" en="7204" />;
};

export default Page;
