import { DateTime } from "../event/datetime";
import { RichTable } from "../table";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { renderWithMap } from "@/lib/utils";
import { Trans } from "@lingui/react/macro";
import { Badge } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { FC } from "react";

const STATUS_BADGE_MAP: Map<components["schemas"]["TrainingApplicationStatus"], FC> = new Map([
  [
    "pending",
    () => (
      <Badge variant="dot" color="yellow">
        <Trans>Pending</Trans>
      </Badge>
    ),
  ],
  [
    "accepted",
    () => (
      <Badge variant="dot" color="green">
        <Trans>Accepted</Trans>
      </Badge>
    ),
  ],
  [
    "rejected",
    () => (
      <Badge variant="dot" color="red">
        <Trans>Rejected</Trans>
      </Badge>
    ),
  ],
]);

const col = createColumnHelper<components["schemas"]["TrainingApplicationDto"]>();
const columns = [
  col.accessor("name", { header: () => <Trans>Title</Trans> }),
  col.accessor("status", {
    header: () => <Trans>Status</Trans>,
    cell: ({ getValue }) => renderWithMap(STATUS_BADGE_MAP, getValue()),
  }),
  col.accessor("trainee.cid", { header: () => <Trans>Trainee CID</Trans> }),
  col.accessor("trainee.full_name", { header: () => <Trans>Trainee Name</Trans> }),
  col.accessor("start_at", {
    header: () => <Trans>Start at</Trans>,
    cell: ({ getValue }) => <DateTime>{getValue()}</DateTime>,
  }),
  col.accessor("end_at", {
    header: () => <Trans>End at</Trans>,
    cell: ({ getValue }) => <DateTime>{getValue()}</DateTime>,
  }),
  col.display({
    id: "actions",
  }),
];

export const TrainingApplicationList: FC = () => {
  const { data, isLoading } = $api.useQuery("get", "/api/atc/trainings/applications");

  return <RichTable data={data} columns={columns} isLoading={isLoading} />;
};
