import { DiscourseDocument } from "@/components/discourse-doc";
import { DocList } from "@/components/doc-list";
import { getAllDocuments } from "@/lib/doc";
import { useLocale } from "@/lib/i18n";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Alert } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/airspace/sop")({
  component: Page,
  loader() {
    return getAllDocuments();
  },
  head: (ctx) => ({ meta: [{ title: ctx.match.context.i18n._(msg`Standard Operation Procedures`) }] }),
});

function Page() {
  const locale = useLocale();
  const documents = Route.useLoaderData();

  return (
    <>
      {locale === "en" && (
        <Alert color="red">
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
      <DiscourseDocument en="7532" />
    </>
  );
}
