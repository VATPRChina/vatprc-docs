import { User } from "@/components/app/user";
import { components } from "@/lib/api";
import { useUser } from "@/lib/client";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { format } from "date-fns";
import { FC } from "react";

type TrainingDto = components["schemas"]["TrainingDto"];

export const TrainingDetail: FC<{ training: TrainingDto }> = ({ training }) => {
  const { i18n } = useLingui();
  const user = useUser();

  return (
    <article className="flex min-w-0 flex-col gap-3 border border-black/15 p-4 dark:border-white/20">
      <h3 className="text-xl font-medium">{training.name}</h3>
      <p className="flex flex-wrap gap-x-4 gap-y-1 border-b border-dashed border-gray-300 pb-3 font-mono text-sm text-gray-600 dark:border-white/20 dark:text-gray-400">
        <span>
          {format(training.start_at, "yyyy-MM-dd HHmm'Z'", { in: utc })}–
          {format(training.end_at, "HHmm'Z'", { in: utc })}
        </span>
        <span className="flex items-center gap-1">
          <Trans>Trainer</Trans>: <User user={training.trainer} />
        </span>
        {user?.id === training.trainer_id && (
          <span className="flex items-center gap-1">
            <Trans>Trainee</Trans>: <User user={training.trainee} />
          </span>
        )}
      </p>
      {(training.record_sheet_filing?.length ?? 0) === 0 ? (
        <p className="text-gray-500 dark:text-gray-400">
          <Trans>No training record has been filed yet.</Trans>
        </p>
      ) : (
        <dl className="flex flex-col gap-3">
          {training.record_sheet_filing?.map((answer) => (
            <div key={answer.field.id}>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {i18n.locale === "en" ? (answer.field.name_en ?? answer.field.name_zh) : answer.field.name_zh}
              </dt>
              <dd className="break-words whitespace-pre-wrap">{answer.answer}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );
};
