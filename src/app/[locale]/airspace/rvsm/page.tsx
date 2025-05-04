import { DiscourseDocument } from "@/components/DiscourseDocument";
import { PageProps } from "@/utils";

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="7182" en="7208" />;
};

export default Page;
