import { MarkdownDoc } from "@/components/doc/markdown-doc";
import { getDocument } from "@/lib/doc";
import { Trans } from "@lingui/react/macro";
import { Skeleton, Alert } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { TbCloudX } from "react-icons/tb";

export const Route = createFileRoute("/docs/$")({
  ssr: true,
  component: RouteComponent,
  loader: ({ params }) => getDocument({ data: `${params._splat}.md` }),
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
        {props.error instanceof Error ? props.error.message : String(props.error)}
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
