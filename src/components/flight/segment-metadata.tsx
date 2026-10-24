import { Fix, FixPair } from "./fix";
import type { components } from "@/lib/api";
import { useLingui } from "@lingui/react/macro";
import { DataList } from "@mantine/core";

export function SegmentMetadata({ segment }: { segment: components["schemas"]["FlightV2Segment"] }) {
  const { t } = useLingui();

  const rows: [string, Fix | null, Fix | null][] = [
    [t`Airport endpoints`, segment.route_start_airport ?? null, segment.route_end_airport ?? null],
    [t`Enroute fixes`, segment.enroute_start_fix, segment.enroute_end_fix],
    [t`Cross-border entry`, segment.cross_border_enter_start_fix ?? null, segment.cross_border_enter_end_fix ?? null],
    [t`Cross-border exit`, segment.cross_border_exit_start_fix ?? null, segment.cross_border_exit_end_fix ?? null],
  ];

  return (
    <DataList>
      {rows.map(
        ([label, from, to]) =>
          from &&
          to && (
            <DataList.Item key={label}>
              <DataList.ItemLabel>{label}</DataList.ItemLabel>
              <DataList.ItemValue>
                <FixPair from={from.identifier} to={to.identifier} />
              </DataList.ItemValue>
            </DataList.Item>
          ),
      )}
    </DataList>
  );
}
