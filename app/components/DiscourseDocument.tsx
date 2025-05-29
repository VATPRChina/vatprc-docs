import { MarkdownDoc } from "./MarkdownDoc";
import { buildMarkdownDoc } from "./MarkdownDoc";
import { m } from "@/lib/i18n/messages";
import { getLocale } from "@/lib/i18n/runtime";
import { Alert, Loader } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import React from "react";

export interface PostMeta {
  title: string;
  thumbnails?: {
    url?: string;
  }[];
}

export const fetcher = async ([, postId]: [string, string]) => {
  const postPath = `${postId}/1`;
  const meta = await fetch(`https://community.vatprc.net/t/topic/${postPath}.json`).then((res) => {
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }
    return res.json() as Promise<PostMeta>;
  });
  const raw = await fetch(`https://community.vatprc.net/raw/${postPath}`).then((res) => {
    if (!res.ok) {
      throw new Error(`Failed to fetch: ${res.status}`);
    }
    return res.text();
  });

  let contentRes = raw.replaceAll("<->", "\\<->");
  let i = 0;
  contentRes = contentRes.replaceAll(/upload:\/\/([\w.-]+)/g, () => {
    const thumbnailUrl = meta.thumbnails?.[i]?.url ?? "";
    i++;
    return thumbnailUrl;
  });

  const doc = await buildMarkdownDoc(contentRes);
  doc.title = meta.title ?? doc.title;
  return doc;
};

export const DiscourseDocument: React.FC<{
  cn?: string;
  en: string;
}> = ({ cn, en }) => {
  const locale = getLocale();

  const postId = locale === "zh-cn" ? (cn ?? en) : en;
  const { data, isLoading, error } = useQuery({
    queryKey: [`https://community.vatprc.net/t/topic/*.json`, postId],
    queryFn: ({ queryKey }) => fetcher([`https://community.vatprc.net/t/topic/${queryKey[1]}.json`, queryKey[1]]),
  });

  if (isLoading) {
    return <Loader />;
  }
  if (error || !data) {
    return (
      <Alert variant="light" color="red" title={m.Components_DiscourseDocument_Error()}>
        {error instanceof Error ? error.message : m.Components_DiscourseDocument_Error()}
      </Alert>
    );
  }
  return (
    <MarkdownDoc toc={data.tableOfContents}>
      <h1 className="text-2xl">{data.title}</h1>
      {<data.MDXContent />}
    </MarkdownDoc>
  );
};
