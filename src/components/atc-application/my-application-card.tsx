import { APPLICATION_STATUS } from "./atc-application-status";
import { LinkButton } from "@/components/ui/link-button";
import { components } from "@/lib/api";
import { useUser } from "@/lib/client";
import { localizeWithMap } from "@/lib/i18n";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { Badge } from "@mantine/core";
import { format } from "date-fns";
import { FC } from "react";

type ApplicationDto = components["schemas"]["AtcApplicationSummaryDto"];

const STATUS_COLOR: Record<components["schemas"]["AtcApplicationStatus"], string> = {
  submitted: "blue",
  "in-waitlist": "yellow",
  approved: "green",
  rejected: "red",
  aborted: "gray",
};

export const MyApplicationCard: FC<{ applications: ApplicationDto[] }> = ({ applications }) => {
  const user = useUser();
  const { i18n } = useLingui();

  const mine = applications
    .filter((application) => application.user_id === user?.id)
    .sort((a, b) => +new Date(b.applied_at) - +new Date(a.applied_at));

  if (mine.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-xl font-medium">
        <Trans>My Application</Trans>
      </h2>
      {mine.map((application) => (
        <div
          key={application.id}
          className="flex flex-wrap items-center gap-x-4 gap-y-2 border border-black/15 px-4 py-3 dark:border-white/20"
        >
          <Badge color={STATUS_COLOR[application.status]} variant="filled" radius={0}>
            {localizeWithMap(APPLICATION_STATUS, application.status, i18n)}
          </Badge>
          <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
            <Trans>Applied at</Trans> {format(application.applied_at, "yyyy-MM-dd HH:mm'Z'", { in: utc })}
          </span>
          <LinkButton
            className="ml-auto"
            variant="subtle"
            to="/controllers/applications/$id"
            params={{ id: application.id }}
          >
            <Trans>View</Trans>
          </LinkButton>
        </div>
      ))}
    </div>
  );
};
