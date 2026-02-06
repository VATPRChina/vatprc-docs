import { components } from "@/lib/api";
import { Trans } from "@lingui/react/macro";
import { FC } from "react";

export const User: FC<{ user?: components["schemas"]["UserDto"] | null }> = ({ user }) => {
  if (!user) return <Trans>Not booked</Trans>;

  return (
    <div>
      <span>{user.full_name}</span>
      <span className="text-dimmed ml-0.5">{user.cid}</span>
    </div>
  );
};
