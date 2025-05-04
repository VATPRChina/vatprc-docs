import { DiscourseDocument } from "@/components/DiscourseDocument";
import { PageProps } from "@/utils";

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="7170" en="7207" />;
};

export default Page;
