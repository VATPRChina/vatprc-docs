import { Sheet } from "@/components/sheet";
import { components } from "@/lib/api";
import { $api, useUser } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Alert, Skeleton } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { FC } from "react";

export const TrainingSelfReflection: FC<{ training: components["schemas"]["TrainingDto"] }> = ({ training }) => {
  const user = useUser();
  const queryClient = useQueryClient();
  const isAdmin = user?.roles.includes("controller-training-director-assistant") ?? false;
  const canEdit = !!user && (user.id === training.trainee_id || isAdmin);
  const canRead =
    canEdit || (!!user && (user.id === training.trainer_id || user.roles.includes("controller-training-mentor")));
  const {
    data: sheet,
    error: loadError,
    isLoading,
  } = $api.useQuery(
    "get",
    "/api/atc/trainings/{id}/self-reflection-sheet",
    { params: { path: { id: training.id } } },
    { enabled: canRead },
  );
  const {
    mutateAsync,
    error: saveError,
    isSuccess,
  } = $api.useMutation("put", "/api/atc/trainings/{id}/self-reflection", {
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries(
          $api.queryOptions("get", "/api/atc/trainings/{id}", { params: { path: { id: training.id } } }),
        ),
        queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/trainings/active")),
        queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/trainings/finished")),
        queryClient.invalidateQueries(
          $api.queryOptions("get", "/api/atc/trainings/by-user/{userId}", {
            params: { path: { userId: training.trainee_id } },
          }),
        ),
      ]);
    },
  });

  if (!canRead) return null;

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl">
        <Trans>Self Reflection</Trans>
      </h2>
      {isSuccess && (
        <Alert color="green">
          <Trans>Self reflection saved successfully.</Trans>
        </Alert>
      )}
      {(loadError ?? saveError) && (
        <Alert color="red" title={(loadError ?? saveError)?.title}>
          {(loadError ?? saveError)?.detail}
        </Alert>
      )}
      {isLoading && <Skeleton h={160} />}
      {sheet && !loadError && (
        <Sheet
          className="flex flex-col gap-2"
          sheet={sheet}
          existingFillingAnswers={training.self_reflection_sheet_filing ?? undefined}
          isSubmitHidden={!canEdit}
          onSubmit={async (answers) => {
            if (!canEdit) return;
            await mutateAsync({ params: { path: { id: training.id } }, body: { request_answers: answers } });
          }}
          submitButtonContent={<Trans>Save</Trans>}
        />
      )}
    </section>
  );
};
