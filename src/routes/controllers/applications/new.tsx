import { AtcApplicationForm } from "@/components/atc-application/atc-application-form";
import { BackButton } from "@/components/back-button";
import { DiscourseDocument, getDiscourseDocumentCode } from "@/components/doc/discourse-doc";
import { Trans } from "@lingui/react/macro";
import { Alert } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/controllers/applications/new")({
  component: RouteComponent,
  async loader() {
    return [await getDiscourseDocumentCode("7188")] as const;
  },
});

function RouteComponent() {
  const [docCode] = Route.useLoaderData();

  return (
    <div className="flex flex-col gap-4">
      <BackButton />
      <h2 className="text-2xl font-medium">
        <Trans>New ATC Application</Trans>
      </h2>
      <Alert color="yellow" title={<Trans>Controller Application Guideline</Trans>}>
        <Trans>
          Please read the following instructions carefully, and make sure the criteria listed has been fully satisfied.
          If a previous application has been rejected, it will be taked into consideration for future applications.
          Chinese proficiency is currently required for all ATC applicants.
        </Trans>
      </Alert>
      <DiscourseDocument code={docCode} cn="7188" en="7188" inline />
      <AtcApplicationForm />
    </div>
  );
}
