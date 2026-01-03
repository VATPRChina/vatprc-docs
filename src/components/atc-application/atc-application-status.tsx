import { Sheet } from "../sheet";
import { components } from "@/lib/api";
import { $api, usePermission } from "@/lib/client";
import { renderWithMap } from "@/lib/utils";
import { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Select, Skeleton } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { ComponentProps, FC, useState } from "react";

export const APPLICATION_STATUS: Map<components["schemas"]["AtcApplicationStatus"], MessageDescriptor> = new Map([
  ["submitted", msg`Submitted`],
  ["in-waitlist", msg`In Waitlist`],
  ["approved", msg`Accepted`],
  ["rejected", msg`Rejected`],
]);

const ATC_APPLICATION_STATUS_ALERTS: Map<components["schemas"]["AtcApplicationStatus"], FC> = new Map([
  [
    "submitted",
    () => (
      <Alert title={<Trans>Submitted</Trans>} color="blue">
        <Trans>Your application has been submitted and is pending review by the staff.</Trans>
      </Alert>
    ),
  ],
  [
    "in-waitlist",
    () => (
      <Alert title={<Trans>In Waitlist</Trans>} color="yellow">
        <Trans>
          Your application has been placed in the waitlist. You will be notified if a spot becomes available.
        </Trans>
      </Alert>
    ),
  ],
  [
    "approved",
    () => (
      <Alert title={<Trans>Accepted</Trans>} color="green">
        <Trans>Your application has been approved. Welcome to start growing to be a controller!</Trans>
      </Alert>
    ),
  ],
  [
    "rejected",
    () => (
      <Alert title={<Trans>Rejected</Trans>} color="red">
        <Trans>
          We regret to inform you that your application has been rejected. Please check the remarks for more details.
        </Trans>
      </Alert>
    ),
  ],
]);

interface AtcApplicationStatusAlertProps {
  applicationId: string;
}

export const AtcApplicationStatusAlert: FC<AtcApplicationStatusAlertProps> = ({ applicationId }) => {
  const { data: application } = $api.useQuery("get", "/api/atc/applications/{id}", {
    params: { path: { id: applicationId } },
  });

  if (!application) {
    return <Skeleton height={64} />;
  }

  return renderWithMap(ATC_APPLICATION_STATUS_ALERTS, application.status);
};

interface AtcApplicationStatusEditProps {
  applicationId: string;
}

export const AtcApplicationStatusEdit: FC<AtcApplicationStatusEditProps> = ({ applicationId }) => {
  const { i18n, t } = useLingui();
  const queryClient = useQueryClient();
  const hasPermission = usePermission("controller-training-director-assistant");

  const { data: application, isLoading: isApplicationLoading } = $api.useQuery("get", "/api/atc/applications/{id}", {
    params: { path: { id: applicationId } },
  });
  const { data: sheet } = $api.useQuery("get", "/api/atc/applications/review-sheet");
  const { mutateAsync: mutateApplicationAsync } = $api.useMutation("put", "/api/atc/applications/{id}");
  const { mutateAsync: mutateReviewAsync } = $api.useMutation("put", "/api/atc/applications/{id}/review");

  const [status, setStatus] = useState<components["schemas"]["AtcApplicationStatus"] | null>(
    application?.status ?? null,
  );

  const onSubmit: ComponentProps<typeof Sheet>["onSubmit"] = async (answers) => {
    if (!status) return;
    await Promise.all([
      mutateApplicationAsync({ params: { path: { id: applicationId } }, body: { status } }),
      mutateReviewAsync({ params: { path: { id: applicationId } }, body: { review_answers: answers } }),
    ]);
    notifications.show({
      title: t`Application review updated`,
      message: t`The ATC application review has been updated successfully.`,
      color: "green",
    });
    await queryClient.invalidateQueries(
      $api.queryOptions("get", "/api/atc/applications/{id}", { params: { path: { id: applicationId ?? "" } } }),
    );
  };

  if (!application) {
    return <Skeleton height={64} />;
  }

  return (
    <div className="flex flex-col gap-2">
      <Skeleton visible={isApplicationLoading}>
        <Select
          label={t`Status`}
          data={APPLICATION_STATUS.entries()
            .map(([id, name]) => ({ value: id, label: i18n.t(name) }))
            .toArray()}
          value={status ?? application.status}
          onChange={(value) => setStatus(value as components["schemas"]["AtcApplicationStatus"] | null)}
          disabled={!hasPermission}
        />
      </Skeleton>
      <Sheet
        className="contents"
        sheet={sheet}
        existingFillingAnswers={application.review_filing_answers ?? []}
        onSubmit={onSubmit}
        isFieldValuesLoading={isApplicationLoading}
        isSubmitDisabled={!status || status === application.status}
        isSubmitHidden={!hasPermission}
        submitButtonContent={<Trans>Submit</Trans>}
        doNotRequirePristine
        confirm={t`Are you sure you want to submit the application review?`}
      />
    </div>
  );
};
