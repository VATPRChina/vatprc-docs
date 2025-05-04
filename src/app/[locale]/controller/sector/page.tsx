import { DiscourseDocument } from "@/components/DiscourseDocument";
import { PageProps } from "@/utils";

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="8652" en="8652" />;
};

export default Page;
