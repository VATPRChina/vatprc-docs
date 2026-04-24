import { DocList } from "@/components/doc/doc-list";
import { getAllDocuments } from "@/lib/doc";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_doc/division/policy")({
  component: Page,
  async loader() {
    const documents = await getAllDocuments();
    return documents.find((document) => document.webPath === "/docs/policy")?.children ?? [];
  },
  head: (ctx) => ({ meta: [{ title: ctx.match.context.i18n._(msg`Division Policies`) }] }),
});

function Page() {
  const documents = Route.useLoaderData();

  return (
    <div className="container mx-auto">
      <h1 className="my-4 text-center text-3xl font-bold">
        <Trans>Division Policies</Trans>
      </h1>
      <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
        <DocList documents={documents} />
      </div>
    </div>
  );
}
