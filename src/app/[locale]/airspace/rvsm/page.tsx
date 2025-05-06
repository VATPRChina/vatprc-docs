import { DiscourseDocument } from "@/components/DiscourseDocument";
import { generateDiscourseMetadata } from "@/components/DiscourseDocument.server";
import { PageProps } from "@/utils";

export const generateMetadata = generateDiscourseMetadata("7182", "7208");

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="7182" en="7208" />;
};

export default Page;
