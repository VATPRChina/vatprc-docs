import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { renderWithMap } from "@/lib/utils";
import { Trans } from "@lingui/react/macro";
import { Alert, Skeleton } from "@mantine/core";
import { FC } from "react";

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

export const AtcApplicationStatusAlert: FC<{ applicationId: string }> = ({ applicationId }) => {
  const { data: application } = $api.useQuery("get", "/api/atc/applications/{id}", {
    params: { path: { id: applicationId } },
  });

  if (!application) {
    return <Skeleton height={64} />;
  }

  return renderWithMap(ATC_APPLICATION_STATUS_ALERTS, application.status);
};
