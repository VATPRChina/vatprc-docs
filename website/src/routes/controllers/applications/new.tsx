import { AtcApplicationForm } from "@/components/atc-application/atc-application-form";
import { BackButton } from "@/components/back-button";
import { useCenterRoles } from "@/components/controller-center/center-context";
import { DiscourseDocument } from "@/components/doc/discourse-doc";
import { getDiscourseDocument } from "@/lib/discourse";
import { Trans } from "@lingui/react/macro";
import { Alert } from "@mantine/core";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import type { FC } from "react";

const RouteComponent: FC = () => {
  const [document] = Route.useLoaderData();
  const { isController } = useCenterRoles();

  if (isController) return <Navigate to="/controllers" replace />;

  return (
    <div className="flex flex-col gap-4">
      <BackButton />
      <h2 className="text-2xl font-bold">
        <Trans>New ATC Application</Trans>
      </h2>
      <Alert color="yellow" title={<Trans>Controller Application Guideline</Trans>}>
        <Trans>
          Please read the following instructions carefully, and make sure the criteria listed has been fully satisfied.
          If a previous application has been rejected, it will be taked into consideration for future applications.
          Chinese proficiency is currently required for all ATC applicants.
        </Trans>
      </Alert>
      <DiscourseDocument document={document} cn="7188" en="7188" inline />
      <AtcApplicationForm />
    </div>
  );
};

export const Route = createFileRoute("/controllers/applications/new")({
  ssr: true,
  component: RouteComponent,
  async loader() {
    return [await getDiscourseDocument({ data: "7188" })] as const;
  },
});
