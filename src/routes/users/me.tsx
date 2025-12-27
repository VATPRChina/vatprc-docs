import { ROLES } from ".";
import { POSITION_KINDS_MAP, POSITION_STATE_MAP } from "@/components/atc-permission-modal";
import { $api, usePermissions, useUser } from "@/lib/client";
import { localizeWithMap } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { Badge } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { formatDate } from "date-fns";

interface FieldProps {
  label: string;
  value?: string;
}

const Field = ({ label, value, children, className, ...props }: FieldProps & React.ComponentProps<"div">) => {
  return (
    <div className={cn("flex flex-col items-start gap-2", className)} {...props}>
      <span className="text-dimmed">{label}</span>
      {value && <span>{value}</span>}
      {children}
    </div>
  );
};

export const Route = createFileRoute("/users/me")({
  component: RouteComponent,
});

function RouteComponent() {
  const { t, i18n } = useLingui();

  const user = useUser();
  const roles = usePermissions();

  const { data } = $api.useQuery("get", "/api/users/me/atc/permissions");

  if (!user) return null;

  return (
    <div className="container mx-auto space-y-4">
      <h1 className="text-3xl">
        <Trans>User Info</Trans>
      </h1>

      <h2 className="text-xl">
        <Trans>Basic Info</Trans>
      </h2>
      <div className="grid grid-cols-4 gap-4">
        <Field label={t`CID`} value={user.cid} />
        <Field label={t`Full name`} value={user.full_name} />
        <Field label={t`Created at`} value={formatDate(user.created_at, "yyyy-MM-dd")} />
        <Field label={t`Updated at`} value={formatDate(user.updated_at, "yyyy-MM-dd")} />
      </div>
      <Field label={t`Roles`}>
        <div className="flex flex-wrap gap-4">
          {roles.map((role) => (
            <Badge key={role} variant="dot" size="lg" color={user.direct_roles.includes(role) ? "green" : "blue"}>
              {localizeWithMap(ROLES, role, i18n)}
            </Badge>
          ))}
        </div>
      </Field>

      <h2 className="text-xl">
        <Trans>Controller Info</Trans>
      </h2>
      <div className="grid grid-cols-4 gap-4">
        {POSITION_KINDS_MAP.entries()
          .map(([id, name]) => {
            const state = data?.find((p) => p.position_kind_id === id)?.state;
            return (
              <Field key={id} label={i18n._(name)}>
                {localizeWithMap(POSITION_STATE_MAP, state, i18n)}
              </Field>
            );
          })
          .toArray()}
      </div>
    </div>
  );
}
