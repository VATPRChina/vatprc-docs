import { DateTime } from "../event/datetime";
import { RichTable } from "../table";
import { ConfirmButton } from "../ui/confirm-button";
import { LinkButton } from "../ui/link-button";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { notifications } from "@mantine/notifications";
import { createColumnHelper } from "@tanstack/react-table";
import { isAfter } from "date-fns";
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
        original: { id, start_at, deleted_at },
      },
    }) => {
      const { mutate } = $api.useMutation("delete", `/api/atc/trainings/{id}`, {
        onSuccess: () =>
          notifications.show({
            message: <Trans>Successfully cancelled the training.</Trans>,
          }),
      });
      const onCancel = () => mutate({ params: { path: { id } } });

      return (
        <div className="flex flex-row items-center gap-2">
          <LinkButton
            variant="subtle"
            size="compact-sm"
            to="/controllers/trainings/$id"
            params={{ id }}
            target="_blank"
          >
            <Trans>View</Trans>
          </LinkButton>
          {deleted_at !== null && (
            <span>
              <Trans>Cancelled</Trans>
            </span>
          )}
          {deleted_at === null && isAfter(start_at, Date.now()) && (
            <ConfirmButton onClick={onCancel} actionDescription={<Trans>Are you sure to cancel this training?</Trans>}>
              <Trans>Cancel</Trans>
            </ConfirmButton>
          )}
        </div>
      );
    },
  }),
];

interface UserTrainingListProps {
  mode: "by-user/{userId}";
  userId: string;
}

type TrainingListProps =
  | {
      mode: "active" | "finished";
      userId: never;
    }
  | UserTrainingListProps;

export const TrainingList: FC<TrainingListProps> = ({ mode, userId }) => {
  const { data, isLoading } = $api.useQuery("get", `/api/atc/trainings/${mode}`, {
    params: { path: { userId } },
  });

  return <RichTable data={data} columns={columns} isLoading={isLoading} />;
};
