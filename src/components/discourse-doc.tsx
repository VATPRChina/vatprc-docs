import { MarkdownDoc } from "./markdown-doc";
import { buildMarkdownDocSync } from "./markdown-doc-lib";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermission } from "@/lib/client";
import { getLocale } from "@/lib/i18n";
import { Trans } from "@lingui/react/macro";
import { createFileRoute, FileRoutesByPath, useLoaderData } from "@tanstack/react-router";
import React, { useMemo } from "react";
import { TbCloudX } from "react-icons/tb";

export interface PostMeta {
  title: string;
  thumbnails?: {
    url?: string;
  }[];
}

export const getDiscourseDocumentCode = async (postId: string) => {
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

  const { compileMarkdownDoc } = await import("./markdown-doc-build");
  const doc = await compileMarkdownDoc(contentRes);
  return doc;
};

export const DiscourseDocument: React.FC<{
  code: string;
  en: string;
  cn: string;
}> = ({ code, en, cn }) => {
  const data = useMemo(() => buildMarkdownDocSync(code), [code]);

  const editPermission = usePermission("admin");
  const editButtons = editPermission && (
    <div className="flex gap-2">
      <Button asChild variant="outline">
        <a href={`https://community.vatprc.net/t/topic/${en}`} target="_blank" rel="noopener noreferrer">
          <Trans>Edit English</Trans>
        </a>
      </Button>
      <Button asChild variant="outline">
        <a href={`https://community.vatprc.net/t/topic/${cn}`} target="_blank" rel="noopener noreferrer">
          <Trans>Edit Chinese</Trans>
        </a>
      </Button>
    </div>
  );

  return (
    <MarkdownDoc toc={data.tableOfContents}>
      <h1 className="text-2xl">{data.title}</h1>
      {<data.MDXContent />}
      {editButtons}
    </MarkdownDoc>
  );
};

export const createDiscourseFileRoute = <TFilePath extends keyof FileRoutesByPath>(
  path: TFilePath,
  cn: string,
  en: string,
): Parameters<ReturnType<typeof createFileRoute<TFilePath>>>[0] => ({
  component: () => {
    const code: string = useLoaderData({ strict: false });
    return <DiscourseDocument code={code} en={en} cn={cn} />;
  },
  async head() {
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
  },
  async loader() {
    const postId = getLocale() === "zh-cn" ? (cn ?? en) : en;
    return await getDiscourseDocumentCode(postId);
  },
  pendingMs: 100,
  pendingComponent: () => (
    <div className="h-svh w-full p-16">
      <Skeleton className="h-full w-full" />
    </div>
  ),
  errorComponent: (props) => {
    return (
      <Alert className="mx-auto max-w-lg" variant="destructive">
        <TbCloudX />
        <AlertTitle>
          <Trans>Failed to load document</Trans>
        </AlertTitle>
        <AlertDescription>{props.error.message}</AlertDescription>
      </Alert>
    );
  },
});
