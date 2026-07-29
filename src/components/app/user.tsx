import { components } from "@/lib/api";
import { Trans } from "@lingui/react/macro";
import { FC } from "react";

export const User: FC<{ user?: components["schemas"]["UserDto"] | null }> = ({ user }) => {
  if (!user) return <Trans>Not booked</Trans>;

  const hasFullName = user.full_name.trim().length > 0;

  return (
    <div>
      {hasFullName && <span>{user.full_name}</span>}
      <span className={hasFullName ? "text-dimmed ml-1" : undefined}>{user.cid}</span>
    </div>
  );
};
