import { DiscourseDocument } from "@/components/DiscourseDocument";
import { generateDiscourseMetadata } from "@/components/DiscourseDocument.server";
import { PageProps } from "@/utils";

export const generateMetadata = generateDiscourseMetadata("7189", "7215");

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="7189" en="7215" />;
};

export default Page;
