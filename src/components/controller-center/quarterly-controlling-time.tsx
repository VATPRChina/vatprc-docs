import { $api } from "@/lib/client";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Card, Skeleton } from "@mantine/core";
import { FC } from "react";

export const formatControllingHours = (totalSeconds: number, locale: string): string =>
  new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(totalSeconds / 3600);

const positionGroups = [
  { rating: "S1", positions: "GND / DEL / RMP" },
  { rating: "S2", positions: "TWR" },
  { rating: "S3", positions: "APP" },
  { rating: "C1+", positions: "CTR" },
] as const;

export const QuarterlyControllingTime: FC = () => {
  const { i18n, t } = useLingui();
  const { data, error, isLoading } = $api.useQuery("get", "/api/users/me/atc/online-time");

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-2xl font-medium">
        <Trans>Controlling History</Trans>
        <span className="ml-2 text-emerald-700 dark:text-emerald-400">{data?.period}</span>
      </h2>
      {isLoading && <Skeleton h={280} />}
      {error && (
        <Alert color="red" title={error.title}>
          <Trans>Failed to load controlling time.</Trans>
        </Alert>
      )}
      {data && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {[
            {
              label: t`Total`,
              key: "total",
              positions: t`All VATPRC positions incl. FSS.`,
              quarter: data.total_seconds,
              lifetime: data.lifetime.total_seconds,
            },
            ...positionGroups.map(({ rating, positions }) => ({
              label: rating === "C1+" ? "C1" : rating,
              key: rating,
              positions,
              quarter: data.by_position[rating],
              lifetime: data.lifetime.by_position[rating],
            })),
          ].map(({ label, key, positions, quarter, lifetime }) => (
            <Card component="article" key={key} aria-labelledby={`controlling-time-${key}`} withBorder>
              <h3 id={`controlling-time-${key}`} className="text-lg font-bold">
                {label}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">{positions}</p>
              <div className="mt-4 grid grid-flow-col grid-rows-[auto_auto] items-baseline">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <Trans>Current quarter</Trans>
                </span>
                <span className="text-3xl font-bold text-emerald-700 tabular-nums dark:text-emerald-400">
                  {formatControllingHours(quarter, i18n.locale)}
                  <span className="font-light text-gray-600 dark:text-gray-400">h</span>
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  <Trans>Lifetime</Trans>
                </span>
                <span className="text-lg font-semibold tabular-nums">
                  {formatControllingHours(lifetime, i18n.locale)}
                  <span className="font-light text-gray-600 dark:text-gray-400">h</span>
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
};
