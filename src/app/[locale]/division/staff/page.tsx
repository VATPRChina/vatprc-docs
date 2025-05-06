import { DiscourseDocument } from "@/components/DiscourseDocument";
import { generateDiscourseMetadata } from "@/components/DiscourseDocument.server";
import { PageProps } from "@/utils";

export const generateMetadata = generateDiscourseMetadata("7190", "7205");

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="7190" en="7205" />;
};

export default Page;
