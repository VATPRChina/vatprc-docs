import { MarkdownDoc } from "./markdown-doc";
import { buildMarkdownDoc } from "./markdown-doc";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { getLocale } from "@/lib/i18n";
import { Trans } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { AnyRouteMatch } from "@tanstack/react-router";
import React from "react";
import { TbAlertCircle } from "react-icons/tb";

export interface PostMeta {
  title: string;
  thumbnails?: {
    url?: string;
  }[];
}

const fetcher = async ([, postId]: [string, string]) => {
  const postPath = `${postId}/1`;
  const [meta, raw] = await Promise.all([
    fetch(`https://community.vatprc.net/t/topic/${postPath}.json`).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      return res.json() as Promise<PostMeta>;
    }),
    await fetch(`https://community.vatprc.net/raw/${postPath}`).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to fetch: ${res.status}`);
      }
      return res.text();
    }),
  ]);

  let contentRes = raw;
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
    return <Skeleton className="h-svh w-full" />;
  }
  if (error || !data) {
    return (
      <Alert variant="destructive">
        <TbAlertCircle className="h-4 w-4" />
        <AlertTitle>
          <Trans>Error</Trans>
        </AlertTitle>
        <AlertDescription>{error?.message}</AlertDescription>
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

export const getDiscourseDocumentMeta =
  (cn: string, en: string): (() => Promise<{ meta?: AnyRouteMatch["meta"] }>) =>
  async () => {
    const postId = getLocale() === "zh-cn" ? (cn ?? en) : en;
    try {
      const meta = await fetch(`https://community.vatprc.net/t/topic/${postId}.json`).then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to fetch: ${res.status}`);
        }
        return res.json() as Promise<PostMeta>;
      });
      return { meta: [{ title: meta.title }] };
    } catch {
      return {};
    }
  };
