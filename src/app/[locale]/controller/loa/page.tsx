import { DiscourseDocument } from "@/components/DiscourseDocument";
import { generateDiscourseMetadata } from "@/components/DiscourseDocument.server";
import { PageProps } from "@/utils";

export const generateMetadata = generateDiscourseMetadata("7217", "7217");

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="7217" en="7217" />;
};

export default Page;
