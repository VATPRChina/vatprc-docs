import { DiscourseDocument } from "@/components/discourse-doc";
import { DocList } from "@/components/doc-list";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { getAllDocuments } from "@/lib/doc";
import { getLocale } from "@/lib/i18n";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/airspace/sop")({
  component: Page,
  loader() {
    return getAllDocuments();
  },
  head: () => ({ meta: [{ title: msg`Standard operation procedures`.message }] }),
});

function Page() {
  const locale = getLocale();
  const documents = Route.useLoaderData();

  return (
    <>
      {locale === "en" && (
        <Alert variant="destructive">
          <AlertTitle>
            <Trans>This page is not available in English.</Trans>
          </AlertTitle>
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
