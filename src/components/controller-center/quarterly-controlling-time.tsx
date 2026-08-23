import { $api } from "@/lib/client";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Skeleton } from "@mantine/core";
import { FC } from "react";

export const formatControllingHours = (totalSeconds: number, locale: string): string =>
  new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(totalSeconds / 3600);

export const QuarterlyControllingTime: FC = () => {
  const { i18n } = useLingui();
  const { data, error, isLoading } = $api.useQuery("get", "/api/users/me/atc/online-time");

  return (
    <section className="flex flex-col gap-1">
      <h2 className="text-2xl font-medium">
        <Trans>Controlling History</Trans>
      </h2>
      {isLoading && <Skeleton h={96} />}
      {error && (
        <Alert color="red" title={error.title}>
          <Trans>Failed to load controlling time.</Trans>
        </Alert>
      )}
      {data && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-l-3 border-black/15 border-l-emerald-600 px-4 py-3 dark:border-white/20 dark:border-l-emerald-400">
          <div>
            <div className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">{data.period}</div>
            <p className="text-gray-700 dark:text-gray-300">
              <Trans>VATPRC positions in the current calendar quarter</Trans>
            </p>
          </div>
          <div className="flex items-baseline gap-1 font-mono">
            <span className="text-4xl font-bold">{formatControllingHours(data.total_seconds, i18n.locale)}</span>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              <Trans>hours</Trans>
            </span>
          </div>
        </div>
      )}
    </section>
  );
};
