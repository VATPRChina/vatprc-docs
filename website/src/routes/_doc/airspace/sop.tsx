import { DiscourseDocument } from "@/components/doc/discourse-doc";
import { DocList } from "@/components/doc/doc-list";
import { getDiscourseDocument } from "@/lib/discourse";
import { getAllDocuments } from "@/lib/doc";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import type { FC } from "react";

const Page: FC = () => {
  const { i18n } = useLingui();
  const locale = i18n.locale;
  const [documents, document] = Route.useLoaderData();

  return (
    <div className="container mx-auto">
      {locale === "en" && (
        <Alert color="yellow">
          <Trans>This page is not available in English.</Trans>
        </Alert>
      )}
      <h1 className="my-4 text-center text-3xl font-bold">
        <Trans>List of SOPs</Trans>
      </h1>
      <DocList
        documents={documents.filter(
          (doc) =>
            doc.webPath.startsWith("/docs/aerodromes") ||
            doc.webPath.startsWith("/docs/enroute") ||
            doc.webPath.startsWith("/docs/terminal_area"),
        )}
      />
      <hr />
      <h1 className="my-4 text-center text-3xl font-bold">
        <Trans>Other SOPs</Trans>
      </h1>
      <DiscourseDocument document={document} cn="7532" en="7532" />
    </div>
  );
};

export const Route = createFileRoute("/_doc/airspace/sop")({
  component: Page,
  async loader() {
    return [await getAllDocuments(), await getDiscourseDocument({ data: "7532" })] as const;
  },
  head: (ctx) => ({ meta: [{ title: ctx.match.context.i18n._(msg`Standard Operation Procedures`) }] }),
});
