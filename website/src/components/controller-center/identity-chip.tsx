import { $api, useUser } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Badge } from "@mantine/core";
import { FC } from "react";

export const getStatusBadges = (status?: { is_visiting: boolean; is_absent: boolean }): ("visiting" | "absent")[] => {
  if (!status) return [];
  return [...(status.is_visiting ? (["visiting"] as const) : []), ...(status.is_absent ? (["absent"] as const) : [])];
};

export const IdentityChip: FC = () => {
  const user = useUser();
  const { data: status } = $api.useQuery("get", "/api/users/me/atc/status", {}, { retry: false, enabled: !!user });

  if (!user || !status) return null;

  return (
    <div className="flex items-center gap-1">
      <Badge color="teal" variant="filled" radius={0} className="font-mono" size="lg">
        {user.cid} · {status.rating}
      </Badge>
      {getStatusBadges(status).map((badge) => (
        <Badge key={badge} color={badge === "absent" ? "red" : "blue"} variant="filled" radius={0}>
          {badge === "absent" ? <Trans>Absent</Trans> : <Trans>Visiting</Trans>}
        </Badge>
      ))}
    </div>
  );
};
