import { MarkdownDoc } from "@/components/doc/markdown-doc";
import { buildMarkdownDocSync } from "@/components/doc/markdown-doc-run";
import { getDocument } from "@/lib/doc";
import { Trans } from "@lingui/react/macro";
import { Skeleton, Alert } from "@mantine/core";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { TbCloudX } from "react-icons/tb";

export const Route = createFileRoute("/docs/$")({
  component: RouteComponent,
  async loader(ctx) {
    try {
      const source = await getDocument({ data: `${ctx.params._splat}.md` });
      const { compileMarkdownDoc } = await import("@/components/doc/markdown-doc-compile");
      const doc = await compileMarkdownDoc(source);
      return doc;
    } catch (exception) {
      if (exception instanceof Error && exception.message.startsWith("ENOENT")) {
        notFound({ throw: true });
      } else {
        throw exception;
      }
    }
  },
  head: () => ({
    meta: [{ name: "robots", content: "noindex" }],
  }),
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

function RouteComponent() {
  const compiled: string = Route.useLoaderData();
  const doc = buildMarkdownDocSync(compiled);

  return (
    <MarkdownDoc>
      <doc.MDXContent />
    </MarkdownDoc>
  );
}
