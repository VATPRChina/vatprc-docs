import { DiscourseDocument } from "@/components/DiscourseDocument";
import { generateDiscourseMetadata } from "@/components/DiscourseDocument.server";
import { PageProps } from "@/utils";

export const generateMetadata = generateDiscourseMetadata("7170", "7207");

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="7170" en="7207" />;
};

export default Page;
