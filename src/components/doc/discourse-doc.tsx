import { MarkdownDoc } from "./markdown-doc";
import type { CompiledMarkdownDoc } from "./markdown-doc-compile";
import { MarkdownContent } from "@/components/doc/markdown-content";
import { COMMUNITY_ENDPOINT, usePermission } from "@/lib/client";
import { MyRouterContext } from "@/lib/route-context";
import { Trans } from "@lingui/react/macro";
import { Alert, Button, ButtonGroup, Skeleton } from "@mantine/core";
import { createFileRoute, FileRoutesByPath, useLoaderData } from "@tanstack/react-router";
import React, { ReactNode } from "react";
import { TbCloudX } from "react-icons/tb";

export interface PostMeta {
  title: string;
  thumbnails?: {
    url?: string;
  }[];
}

export const getDiscourseDocument = async (postId: string) => {
  const postPath = `${postId}/1`;
  const [meta, raw] = await Promise.all([
    fetch(`${COMMUNITY_ENDPOINT}/t/topic/${postPath}.json`).then((res) => {
      return res.json() as Promise<PostMeta>;
    }),
    fetch(`${COMMUNITY_ENDPOINT}/raw/${postPath}`).then((res) => {
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

  const { compileMarkdownDoc } = await import("./markdown-doc-compile");
  const doc = await compileMarkdownDoc(contentRes);
  return doc;
};

export const DiscourseDocument: React.FC<{
  document: CompiledMarkdownDoc;
  en: string;
  cn: string;
  inline?: boolean;
  extraHeader?: ReactNode;
}> = ({ document, en, cn, inline, extraHeader }) => {
  const editPermission = usePermission("staff");
  const editButtons = editPermission && (
    <ButtonGroup className="mb-2 gap-1!">
      <Button
        component="a"
        variant="subtle"
        href={`https://community.vatprc.net/t/topic/${en}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Trans>Edit English</Trans>
      </Button>
      <Button
        component="a"
        variant="subtle"
        href={`https://community.vatprc.net/t/topic/${cn}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Trans>Edit Chinese</Trans>
      </Button>
    </ButtonGroup>
  );

  return (
    <MarkdownDoc tocHeader={editButtons} inline={inline}>
      {extraHeader}
      <h1 className="text-2xl">{document.title}</h1>
      <MarkdownContent document={document} />
    </MarkdownDoc>
  );
};

export const createDiscourseFileRoute = <TFilePath extends keyof FileRoutesByPath>(
  _path: TFilePath,
  cn: string,
  en: string,
  extraHeader?: ReactNode,
): Parameters<ReturnType<typeof createFileRoute<TFilePath>>>[0] => ({
  component: () => {
    const document: CompiledMarkdownDoc = useLoaderData({ strict: false });
    return <DiscourseDocument document={document} en={en} cn={cn} extraHeader={extraHeader} />;
  },
  async head(ctx) {
    const postId = (ctx.match.context as MyRouterContext).i18n.locale === "zh-cn" ? (cn ?? en) : en;
    try {
      const meta = await fetch(`${COMMUNITY_ENDPOINT}/t/topic/${postId}.json`).then((res) => {
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
  async loader(ctx) {
    const postId = (ctx.context as MyRouterContext).i18n.locale === "zh-cn" ? (cn ?? en) : en;
    return await getDiscourseDocument(postId);
  },
  pendingMs: 100,
  pendingComponent: () => (
    <div className="h-svh w-full p-16">
      <Skeleton h="100svh" />
    </div>
  ),
  errorComponent: (props) => {
    return (
      <Alert
        icon={<TbCloudX />}
        title={<Trans>Failed to load document</Trans>}
        color="red"
        className="container mx-auto"
      >
        {props.error.message}
      </Alert>
    );
  },
});
