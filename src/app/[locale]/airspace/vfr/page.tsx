import { DiscourseDocument } from "@/components/DiscourseDocument";
import { generateDiscourseMetadata } from "@/components/DiscourseDocument.server";
import { PageProps } from "@/utils";

export const generateMetadata = generateDiscourseMetadata("7183", "7209");

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="7183" en="7209" />;
};

export default Page;
