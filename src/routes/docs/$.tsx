import { MarkdownDoc } from "@/components/markdown-doc";
import { getDocument } from "@/lib/doc";
import { Trans } from "@lingui/react/macro";
import { Alert } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, notFound } from "@tanstack/react-router";

export const Route = createFileRoute("/docs/$")({
  component: RouteComponent,
  async loader(ctx) {
    try {
      const source = await getDocument({ data: `${ctx.params._splat}.md` });
      return source;
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
});

function RouteComponent() {
  const { _splat: path } = Route.useParams();
  const source = Route.useLoaderData();

  const { data, error } = useQuery({
    queryKey: ["://app/lib/doc.ts/getDocument", path],
    queryFn: () =>
      import("@/components/markdown-doc-build").then(({ buildMarkdownDoc }) => buildMarkdownDoc(source ?? "")),
  });

  if (error) {
    return (
      <Alert color="red" title={<Trans>Failed to load document.</Trans>}>
        {error.message}
      </Alert>
    );
  }
  if (!data) return null;
  return (
    <MarkdownDoc toc={data.tableOfContents}>
      <data.MDXContent />
    </MarkdownDoc>
  );
}
