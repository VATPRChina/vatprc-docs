import { DiscourseDocument } from "@/components/DiscourseDocument";
import { generateDiscourseMetadata } from "@/components/DiscourseDocument.server";
import { PageProps } from "@/utils";

export const generateMetadata = generateDiscourseMetadata("7191", "7206");

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="7191" en="7206" />;
};

export default Page;
