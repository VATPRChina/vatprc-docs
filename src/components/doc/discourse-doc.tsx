import { MarkdownDoc } from "./markdown-doc";
import { buildMarkdownDocSync } from "./markdown-doc-run";
import { usePermission } from "@/lib/client";
import { getLocale } from "@/lib/i18n";
import { Trans } from "@lingui/react/macro";
import { Alert, Button, ButtonGroup, Skeleton } from "@mantine/core";
import { createFileRoute, FileRoutesByPath, useLoaderData } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import React, { useMemo } from "react";
import { TbCloudX } from "react-icons/tb";

export interface PostMeta {
  title: string;
  thumbnails?: {
    url?: string;
  }[];
}

const COMMUNITY_ENDPOINT = createIsomorphicFn()
  .server(() => "https://community.vatprc.net")
  .client(() => (process.env.NODE_ENV === "development" ? "/community" : "https://community.vatprc.net"))();

export const getDiscourseDocumentCode = async (postId: string) => {
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
  code: string;
  en: string;
  cn: string;
}> = ({ code, en, cn }) => {
  const data = useMemo(() => buildMarkdownDocSync(code), [code]);

  const editPermission = usePermission("staff");
  const editButtons = editPermission && (
    <ButtonGroup mb="md">
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
    <MarkdownDoc tocHeader={editButtons}>
      <h1 className="text-2xl">{data.title}</h1>
      {<data.MDXContent />}
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
  async loader() {
    const postId = getLocale() === "zh-cn" ? (cn ?? en) : en;
    return await getDiscourseDocumentCode(postId);
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
