import { DiscourseDocument } from "@/components/DiscourseDocument";
import { generateDiscourseMetadata } from "@/components/DiscourseDocument.server";
import { PageProps } from "@/utils";

export const generateMetadata = generateDiscourseMetadata("7186", "7210");

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="7186" en="7210" />;
};

export default Page;
