import { DateTime } from "../event/datetime";
import { RichTable } from "../table";
import { LinkButton } from "../ui/link-button";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { createColumnHelper } from "@tanstack/react-table";
import { FC } from "react";

const col = createColumnHelper<components["schemas"]["TrainingDto"]>();
const columns = [
  col.accessor("name", { header: () => <Trans>Title</Trans> }),
  col.accessor("trainee.cid", { header: () => <Trans>Trainee CID</Trans> }),
  col.accessor("trainee.full_name", { header: () => <Trans>Trainee Name</Trans> }),
  col.accessor("trainer.cid", { header: () => <Trans>Trainer CID</Trans> }),
  col.accessor("trainer.full_name", { header: () => <Trans>Trainer Name</Trans> }),
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
    header: () => <Trans>Actions</Trans>,
    cell: ({
      row: {
        original: { id },
      },
    }) => (
      <LinkButton variant="subtle" size="compact-sm" to="/controllers/trainings/$id" params={{ id }}>
        <Trans>View</Trans>
      </LinkButton>
    ),
  }),
];

interface TrainingListProps {
  mode: "active" | "finished";
}

export const TrainingList: FC<TrainingListProps> = ({ mode }) => {
  const { data, isLoading } = $api.useQuery("get", `/api/atc/trainings/${mode}`);

  return <RichTable data={data} columns={columns} isLoading={isLoading} />;
};
