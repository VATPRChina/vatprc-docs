import { RichTable } from "../table";
import { TrainingApplicationResponsesModal } from "./training-application-responses";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { renderWithMap } from "@/lib/utils";
import { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { Trans } from "@lingui/react/macro";
import { Badge } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { FC } from "react";

const STATUS_BADGE_LABEL_MAP: Map<components["schemas"]["TrainingApplicationStatus"], MessageDescriptor> = new Map([
  ["pending", msg`Pending`],
  ["accepted", msg`Accepted`],
  ["rejected", msg`Rejected`],
  ["cancelled", msg`Cancelled`],
]);

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
  [
    "cancelled",
    () => (
      <Badge variant="dot" color="gray">
        <Trans>Cancelled</Trans>
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
    meta: {
      filterValues: STATUS_BADGE_LABEL_MAP.entries()
        .map(([value, label]) => ({ value, label }))
        .toArray(),
    },
  }),
  col.accessor("trainee.cid", { header: () => <Trans>Trainee CID</Trans> }),
  col.accessor("trainee.full_name", { header: () => <Trans>Trainee Name</Trans> }),
  col.display({
    id: "actions",
    cell: ({ row }) => <TrainingApplicationResponsesModal id={row.original.id} />,
  }),
];

export const TrainingApplicationList: FC = () => {
  const { data, isLoading } = $api.useQuery("get", "/api/atc/trainings/applications");

  return <RichTable data={data} columns={columns} isLoading={isLoading} />;
};
