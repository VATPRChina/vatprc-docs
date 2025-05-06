import { buildMarkdownDoc } from "./MarkdownDoc";
import { PageProps } from "@/utils";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

export interface PostMeta {
  title: string;
  thumbnails?: {
    url?: string;
  }[];
}

export const fetcher = async ([, postId]: [string, string]) => {
  const postPath = `${postId}/1`;
  const meta: PostMeta = await fetch(
    `https://community.vatprc.net/t/topic/${postPath}.json`,
  ).then((res) => {
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }
    return res.json();
  });
  const raw = await fetch(`https://community.vatprc.net/raw/${postPath}`).then(
    (res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      return res.text();
    },
  );

  let contentRes = raw.replaceAll("<->", "\\<->");
  let i = 0;
  contentRes = contentRes.replaceAll(/upload:\/\/([\w.-]+)/g, () => {
    const thumbnailUrl = meta.thumbnails?.[i]?.url ?? "";
    i++;
    return thumbnailUrl;
  });

  const doc = await buildMarkdownDoc(contentRes);
  doc.title ??= meta.title;
  return doc;
};

export const generateDiscourseMetadata =
  (cn: string | undefined, en: string) =>
  async ({ params }: PageProps<"locale">): Promise<Metadata> => {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations("Legacy");

    const postId = locale === "zh-cn" ? (cn ?? en) : en;
    const doc = await fetcher(["", postId]);
    console.log(doc);
    return { title: `${doc.title} - ${t("title")}` };
  };
