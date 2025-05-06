import { DiscourseDocument } from "@/components/DiscourseDocument";
import { generateDiscourseMetadata } from "@/components/DiscourseDocument.server";
import { PageProps } from "@/utils";

export const generateMetadata = generateDiscourseMetadata("8884", "8884");

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="8884" en="8884" />;
};

export default Page;
