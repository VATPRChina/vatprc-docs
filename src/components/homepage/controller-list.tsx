import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { cn } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans } from "@lingui/react/macro";
import { Checkbox, Skeleton } from "@mantine/core";
import { format } from "date-fns";
import { ChangeEvent, useState } from "react";

interface PermissionTagProps {
  permissions: components["schemas"]["AtcPermissionDto"][];
  kind: string;
}
const PermissionTag = ({ permissions, kind }: PermissionTagProps) => {
  const permission = permissions.find((p) => p.position_kind_id === kind);

  if (!permission) return null;

  return (
    <span
      className={cn(
        "flex items-end gap-1 px-2 py-1",
        (permission.state === "certified" || permission.state === "mentor") &&
          "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
        permission.state === "under-mentor" && "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
        permission.state === "solo" && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
        permission.state === "student" && "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
      )}
    >
      {permission.position_kind_id}
      {permission.state === "student" && <span className="text-xs">(✘)</span>}
      {permission.state === "under-mentor" && <span className="text-xs">(T)</span>}
      {permission.state === "solo" && <span className="text-xs">(S)</span>}
      {permission.solo_expires_at && (
        <span className="text-xs">
          <Trans>until</Trans> {format(permission.solo_expires_at, "yyyy-MM-dd", { in: utc })}
        </span>
      )}
    </span>
  );
};

const ratingsSorting = ["OBS", "S1", "S2", "S3", "C1", "C3", "I1", "I3"];

export const ControllerList: React.FC = () => {
  const [showAbsent, setShowAbsent] = useState(false);

  const { data, isLoading } = $api.useQuery("get", "/api/atc/controllers");

  const onShowAbsentChange = (e: ChangeEvent<HTMLInputElement>) => setShowAbsent(e.target.checked === true);

  if (isLoading) {
    return <Skeleton w="100%" h="100dvh" />;
  }

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="flex items-center gap-x-2">
        <Checkbox onChange={onShowAbsentChange} id="show-absent" label={<Trans>Show Absence Controllers</Trans>} />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data
          ?.sort((ca, cb) => {
            if (ca.rating !== cb.rating) {
              return ratingsSorting.indexOf(cb.rating) - ratingsSorting.indexOf(ca.rating);
            }
            if (ca.is_visiting && !cb.is_visiting) {
              return 1;
            }
            if (!ca.is_visiting && cb.is_visiting) {
              return -1;
            }
            if (ca.is_absent) {
              return 1;
            }
            if (cb.is_absent) {
              return -1;
            }
            return ca.user.cid.localeCompare(cb.user.cid);
          })
          ?.filter((ctr) => showAbsent || !ctr.is_absent)
          ?.map((ctr) => (
            <div key={ctr.user.id} className="hover:bg-secondary flex flex-col gap-4 border px-6 py-4">
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{ctr.user.full_name}</span>
                <span className="text-sm font-light">{ctr.user.cid}</span>
                <span className="font-bold">
                  {ctr.rating}
                  {ctr.is_visiting && <span className="font-light">(V)</span>}
                </span>
                {ctr.is_absent && (
                  <span className="font-bold text-red-700">
                    <Trans>Absent</Trans>
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 font-mono text-sm">
                <PermissionTag permissions={ctr.permissions} kind="FSS" />
                <PermissionTag permissions={ctr.permissions} kind="CTR" />
                <PermissionTag permissions={ctr.permissions} kind="APP" />
                <PermissionTag permissions={ctr.permissions} kind="T2" />
                <PermissionTag permissions={ctr.permissions} kind="TWR" />
                <PermissionTag permissions={ctr.permissions} kind="GND" />
                <PermissionTag permissions={ctr.permissions} kind="DEL" />
                <PermissionTag permissions={ctr.permissions} kind="FMP" />
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
