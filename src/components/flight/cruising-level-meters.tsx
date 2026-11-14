import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { getCruisingLevelInMeters, formatCruisingLevelInMeters } from "@/lib/altitude";
import { useLingui } from "@lingui/react/macro";

export const CruisingLevelMeters = ({ feet }: { feet: number }) => {
  const { t } = useLingui();
  const { isChinaRvsm } = getCruisingLevelInMeters(feet);
  const metricAltitude = <span className="text-muted-foreground text-sm">{formatCruisingLevelInMeters(feet)}</span>;

  if (!isChinaRvsm) return metricAltitude;

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        <span className="text-muted-foreground text-sm underline decoration-dotted underline-offset-2">
          {formatCruisingLevelInMeters(feet)}
        </span>
      </TooltipTrigger>
      <TooltipContent>{t`China RVSM`}</TooltipContent>
    </Tooltip>
  );
};
