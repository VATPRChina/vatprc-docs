import { DiscourseDocument } from "@/components/DiscourseDocument";
import { generateDiscourseMetadata } from "@/components/DiscourseDocument.server";
import { PageProps } from "@/utils";

export const generateMetadata = generateDiscourseMetadata("8652", "8652");

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="8652" en="8652" />;
};

export default Page;
