import { MarkdownDoc } from "./markdown-doc";
import { MarkdownContent } from "@/components/doc/markdown-content";
import { usePermission } from "@/lib/client";
import { getDiscourseDocument } from "@/lib/discourse";
import { MyRouterContext } from "@/lib/route-context";
import { Trans } from "@lingui/react/macro";
import { Alert, Button, ButtonGroup, Skeleton } from "@mantine/core";
import { createFileRoute, FileRoutesByPath, useLoaderData } from "@tanstack/react-router";
import React, { ReactNode } from "react";
import { TbCloudX } from "react-icons/tb";

type DiscoursePageData = Awaited<ReturnType<typeof getDiscourseDocument>>;

export const DiscourseDocument: React.FC<{
  document: Pick<DiscoursePageData, "markdown" | "title">;
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
      <MarkdownContent markdown={document.markdown} />
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
    const document: DiscoursePageData = useLoaderData({ strict: false });
    return <DiscourseDocument document={document} en={en} cn={cn} extraHeader={extraHeader} />;
  },
  head({ loaderData }) {
    const document = loaderData as DiscoursePageData | undefined;
    return document?.postTitle ? { meta: [{ title: document.postTitle }] } : {};
  },
  async loader(ctx) {
    const postId = (ctx.context as MyRouterContext).i18n.locale === "zh-cn" ? (cn ?? en) : en;
    return await getDiscourseDocument({ data: postId });
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
        {props.error instanceof Error ? props.error.message : String(props.error)}
      </Alert>
    );
  },
});
