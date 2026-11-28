import { getCruisingLevelInMeters, formatCruisingLevelInMeters } from "@/lib/altitude";
import { useLingui } from "@lingui/react/macro";
import { Tooltip } from "@mantine/core";
import type { FC } from "react";

export const CruisingLevelMeters: FC<{ feet: number }> = ({ feet }) => {
  const { t } = useLingui();
  const { isChinaRvsm } = getCruisingLevelInMeters(feet);
  const metricAltitude = <span className="text-dimmed text-sm">{formatCruisingLevelInMeters(feet)}</span>;

  if (!isChinaRvsm) return metricAltitude;

  return (
    <Tooltip label={t`China RVSM`}>
      <span className="text-muted-foreground text-sm underline decoration-dotted underline-offset-2">
        {formatCruisingLevelInMeters(feet)}
      </span>
    </Tooltip>
  );
};
