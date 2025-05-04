import { DiscourseDocument } from "@/components/DiscourseDocument";
import { PageProps } from "@/utils";

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="7166" en="7204" />;
};

export default Page;
