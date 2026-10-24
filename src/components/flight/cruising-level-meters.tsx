import { getCruisingLevelInMeters, formatCruisingLevelInMeters } from "@/lib/altitude";
import { useLingui } from "@lingui/react/macro";
import { Tooltip } from "@mantine/core";

export const CruisingLevelMeters = ({ feet }: { feet: number }) => {
  const { t } = useLingui();
  const { isChinaRvsm } = getCruisingLevelInMeters(feet);
  const metricAltitude = <span className="text-muted-foreground text-sm">{formatCruisingLevelInMeters(feet)}</span>;

  if (!isChinaRvsm) return metricAltitude;

  return (
    <Tooltip label={t`China RVSM`}>
      <span className="text-muted-foreground text-sm underline decoration-dotted underline-offset-2">
        {formatCruisingLevelInMeters(feet)}
      </span>
    </Tooltip>
  );
};
