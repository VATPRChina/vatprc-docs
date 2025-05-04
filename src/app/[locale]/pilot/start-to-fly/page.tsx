import { DiscourseDocument } from "@/components/DiscourseDocument";
import { PageProps } from "@/utils";

const Page = async ({}: PageProps<"locale">) => {
  return <DiscourseDocument cn="7185" en="7211" />;
};

export default Page;
