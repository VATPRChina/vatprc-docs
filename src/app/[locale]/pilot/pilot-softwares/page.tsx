import { DiscourseDocument } from "@/components/DiscourseDocument";
import { generateDiscourseMetadata } from "@/components/DiscourseDocument.server";
import { PageProps } from "@/utils";

export const generateMetadata = generateDiscourseMetadata("9143", "9143");

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="9143" en="9143" />;
};

export default Page;
