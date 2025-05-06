import { DiscourseDocument } from "@/components/DiscourseDocument";
import { generateDiscourseMetadata } from "@/components/DiscourseDocument.server";
import { PageProps } from "@/utils";

export const generateMetadata = generateDiscourseMetadata("7185", "7211");

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="7185" en="7211" />;
};

export default Page;
