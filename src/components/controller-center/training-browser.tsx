import { TrainingDetail } from "./training-detail";
import { TrainingApplicationCreateModal } from "@/components/atc-training/training-application-create";
import { components } from "@/lib/api";
import { $api, useUser } from "@/lib/client";
import { cn } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans } from "@lingui/react/macro";
import { Alert, Badge, Skeleton } from "@mantine/core";
import { format } from "date-fns";
import { FC, useState } from "react";
import { TbArrowLeft } from "react-icons/tb";

export const sortTrainings = <T extends { start_at: string }>(trainings: T[], now: Date): T[] => {
  const future = trainings
    .filter((t) => new Date(t.start_at) >= now)
    .sort((a, b) => +new Date(a.start_at) - +new Date(b.start_at));
  const past = trainings
    .filter((t) => new Date(t.start_at) < now)
    .sort((a, b) => +new Date(b.start_at) - +new Date(a.start_at));
  return [...future, ...past];
};

type TrainingDto = components["schemas"]["TrainingDto"];

const TrainingListItem: FC<{
  training: TrainingDto;
  isUpcoming: boolean;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ training, isUpcoming, isSelected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    aria-current={isSelected}
    className={cn(
      "flex w-full flex-col gap-0.5 border-b border-l-3 border-b-gray-200 px-3 py-2 text-left last:border-b-0 dark:border-b-gray-800",
      isUpcoming ? "border-l-emerald-600 dark:border-l-emerald-400" : "border-l-gray-300 dark:border-l-gray-600",
      isSelected ? "bg-gray-100 dark:bg-gray-900" : "hover:bg-gray-50 dark:hover:bg-gray-900/50",
    )}
  >
    <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
      {format(training.start_at, "yyyy-MM-dd HHmm'Z'", { in: utc })}
      {isUpcoming && (
        <Badge component="span" ml={8} size="xs" color="green" radius={0}>
          <Trans>Upcoming</Trans>
        </Badge>
      )}
    </span>
    <span className="text-sm font-medium">{training.name}</span>
    <span className="text-xs text-gray-600 dark:text-gray-400">{training.trainer.full_name}</span>
  </button>
);

export const TrainingBrowser: FC = () => {
  const user = useUser();
  const now = new Date();

  const {
    data: trainings,
    isLoading,
    error,
  } = $api.useQuery(
    "get",
    "/api/atc/trainings/by-user/{userId}",
    { params: { path: { userId: user?.id ?? "" } } },
    { enabled: !!user },
  );
  const { data: applications } = $api.useQuery(
    "get",
    "/api/atc/trainings/applications",
    {},
    { enabled: !!user, retry: false },
  );

  const sorted = sortTrainings(trainings ?? [], now);
  const myPendingApplications = (applications ?? []).filter((a) => a.trainee_id === user?.id && a.status === "pending");

  const [selectedId, setSelectedId] = useState<string>();
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const selected = sorted.find((t) => t.id === selectedId) ?? sorted[0];

  if (isLoading) return <Skeleton w="100%" h={240} />;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-medium">
          <Trans>My Trainings</Trans>
        </h2>
        <TrainingApplicationCreateModal />
      </div>
      {error ? (
        <Alert color="red" title={<Trans>Failed to load trainings</Trans>}>
          <Trans>Please refresh the page or try again later.</Trans>
        </Alert>
      ) : (
        <>
          {myPendingApplications.map((application) => (
            <p
              key={application.id}
              className="border border-l-3 border-gray-200 border-l-gray-300 px-3 py-2 font-mono text-sm text-gray-600 dark:border-gray-800 dark:border-l-gray-600 dark:text-gray-300"
            >
              <Trans>Application pending review</Trans> · {application.name}
            </p>
          ))}
          {sorted.length === 0 ? (
            <p className="border border-gray-200 px-4 py-6 text-gray-600 dark:border-gray-800 dark:text-gray-300">
              <Trans>You have no training sessions yet. Apply for a training to get started.</Trans>
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className={cn("border border-gray-200 dark:border-gray-800", mobileDetailOpen && "hidden md:block")}>
                {sorted.map((training) => (
                  <TrainingListItem
                    key={training.id}
                    training={training}
                    isUpcoming={new Date(training.start_at) >= now}
                    isSelected={training.id === selected?.id}
                    onSelect={() => {
                      setSelectedId(training.id);
                      setMobileDetailOpen(true);
                    }}
                  />
                ))}
              </div>
              <div className={cn("md:col-span-2", !mobileDetailOpen && "hidden md:block")}>
                <button
                  type="button"
                  onClick={() => setMobileDetailOpen(false)}
                  className="mb-2 flex items-center gap-1 text-sm text-gray-600 md:hidden dark:text-gray-300"
                >
                  <TbArrowLeft size={16} />
                  <Trans>Back to list</Trans>
                </button>
                {selected && <TrainingDetail training={selected} />}
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};
