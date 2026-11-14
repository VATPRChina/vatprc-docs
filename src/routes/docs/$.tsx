import { MarkdownDoc } from "@/components/doc/markdown-doc";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { getDocument } from "@/lib/doc";
import { Trans } from "@lingui/react/macro";
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
      }
      throw exception;
    }
  },
  head: () => ({
    meta: [{ name: "robots", content: "noindex" }],
  }),
  pendingMs: 100,
  pendingComponent: () => (
    <div className="h-svh w-full p-16">
      <Skeleton style={{ height: "100svh" }} />
    </div>
  ),
  errorComponent: (props) => {
    return (
      <Alert className="container mx-auto" variant={"destructive"}>
        {<TbCloudX />}
        <AlertTitle>{<Trans>Failed to load document</Trans>}</AlertTitle>
        <AlertDescription>{props.error.message}</AlertDescription>
      </Alert>
    );
  },
});

function RouteComponent() {
  const doc = Route.useLoaderData();

  return (
    <MarkdownDoc>
      <div dangerouslySetInnerHTML={{ __html: doc.html }} />
    </MarkdownDoc>
  );
}
