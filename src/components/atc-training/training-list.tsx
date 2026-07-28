import { User } from "../app/user";
import { DateTime } from "../event/datetime";
import { RichTable } from "../table";
import { ConfirmButton } from "../ui/confirm-button";
import { LinkButton } from "../ui/link-button";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Alert } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { isAfter } from "date-fns";
import { FC } from "react";

const col = createColumnHelper<components["schemas"]["TrainingDto"]>();
const columns = [
  col.accessor("name", { header: () => <Trans>Title</Trans> }),
  col.accessor((training) => `${training.trainee.full_name} ${training.trainee.cid}`.trim(), {
    id: "trainee",
    header: () => <Trans>Trainee</Trans>,
    cell: ({ row }) => <User user={row.original.trainee} />,
  }),
  col.accessor((training) => `${training.trainer.full_name} ${training.trainer.cid}`.trim(), {
    id: "trainer",
    header: () => <Trans>Trainer</Trans>,
    cell: ({ row }) => <User user={row.original.trainer} />,
  }),
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
      const { mutate, error, isPending, isSuccess } = $api.useMutation("delete", `/api/atc/trainings/{id}`);
      const onCancel = () => mutate({ params: { path: { id } } });

      return (
        <div className="flex flex-row items-center gap-1">
          <LinkButton variant="subtle" size="compact-sm" to="/controllers/trainings/$id" params={{ id }}>
            <Trans>View</Trans>
          </LinkButton>
          {deleted_at !== null && (
            <span>
              <Trans>Cancelled</Trans>
            </span>
          )}
          {deleted_at === null && isAfter(start_at, Date.now()) && (
            <ConfirmButton
              onClick={onCancel}
              loading={isPending}
              actionDescription={<Trans>Are you sure to cancel this training?</Trans>}
              variant="subtle"
              size="compact-sm"
            >
              <Trans>Cancel Training</Trans>
            </ConfirmButton>
          )}
          {isSuccess && (
            <span className="text-green-700 dark:text-green-400">
              <Trans>Successfully cancelled the training.</Trans>
            </span>
          )}
          {error && (
            <Alert color="red" title={error.title}>
              {error.detail}
            </Alert>
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
    }
  | UserTrainingListProps;

export const TrainingList: FC<TrainingListProps> = (props) => {
  const { data, error, isLoading } = $api.useQuery(
    "get",
    `/api/atc/trainings/${props.mode}`,
    props.mode === "by-user/{userId}" ? { params: { path: { userId: props.userId } } } : {},
  );

  return (
    <div className="flex flex-col gap-1">
      {error && (
        <Alert color="red" title={error.title}>
          {error.detail}
        </Alert>
      )}
      <RichTable data={data} columns={columns} isLoading={isLoading} />
    </div>
  );
};
