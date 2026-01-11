import { DateTimeInput } from "./ui/datetime-input";
import { components } from "@/lib/api";
import { $api, useUser } from "@/lib/client";
import { promiseWithToast } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Button, Group, Modal, Select, Stack, TextInput, Textarea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@tanstack/react-form";
import { formatISO } from "date-fns";
import { FC } from "react";
import { TbEdit } from "react-icons/tb";

const CRUISE_LEVELS = {
  standard: msg`metric flight level (meters)`,
  "standard-odd": msg`metric odd flight level (meters)`,
  "standard-even": msg`metric even flight level (meters)`,
  "flight-level": msg`imperial flight level (feet)`,
  "flight-level-odd": msg`imperial odd flight level (feet)`,
  "flight-level-even": msg`imperial even flight level (feet)`,
} satisfies Record<components["schemas"]["LevelRestrictionType"], MessageDescriptor>;

interface CreatePreferredRouteProps {
  id?: string;
}

export const CreatePreferredRoute: FC<CreatePreferredRouteProps> = ({ id }) => {
  const { t, i18n } = useLingui();
  const [opened, { toggle, close }] = useDisclosure(false);

  const user = useUser();
  const { data, isLoading } = $api.useQuery(
    "get",
    "/api/navdata/preferred-routes/{id}",
    { params: { path: { id: id ?? "" } } },
    { enabled: !!id && opened },
  );
  const title = data?.departure && data?.arrival ? `${data.departure} - ${data.arrival}` : null;

  const { mutate: create, isPending: isCreatePending } = $api.useMutation("post", "/api/navdata/preferred-routes", {
    onSuccess: () => close(),
  });
  const { mutate: update, isPending: isUpdatePending } = $api.useMutation("put", "/api/navdata/preferred-routes/{id}", {
    onSuccess: () => close(),
  });
  const form = useForm({
    defaultValues: {
      departure: data?.departure ?? "",
      arrival: data?.arrival ?? "",
      raw_route: data?.raw_route ?? "",
      cruising_level_restriction: data?.cruising_level_restriction ?? "standard-even",
      allowed_altitudes: data?.allowed_altitudes ?? [],
      minimal_altitude: data?.minimal_altitude ?? 0,
      remarks: data?.remarks ?? `[Manual] Created by ${user?.cid}/${user?.full_name}`,
      valid_from: data?.valid_from,
      valid_until: data?.valid_until,
    } satisfies components["schemas"]["PreferredRouteSaveRequest"],
    onSubmit: ({ value }) => {
      if (id) {
        update({ params: { path: { id } }, body: value });
      } else {
        create({ body: value });
      }
    },
  });

  if (!user?.roles.includes("event-coordinator")) return null;

  return (
    <>
      {id ? (
        <ActionIcon variant="subtle" aria-label={t`Edit Preferred Route {title}`} onClick={toggle}>
          <TbEdit size={18} />
        </ActionIcon>
      ) : (
        <Button onClick={toggle}>
          <Trans>Create Preferred Route</Trans>
        </Button>
      )}
      <Modal
        opened={opened}
        onClose={close}
        size="xl"
        title={id ? t`Edit Preferred Route ${title}` : t`Create Preferred Route`}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            promiseWithToast(form.handleSubmit());
          }}
        >
          <Stack>
            <Group grow>
              <form.Field name="departure">
                {(field) => (
                  <TextInput
                    label={t`Departure`}
                    onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                  ></TextInput>
                )}
              </form.Field>
              <form.Field name="arrival">
                {(field) => (
                  <TextInput
                    label={t`Arrival`}
                    onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                  ></TextInput>
                )}
              </form.Field>
            </Group>
            <Group grow>
              <form.Field name="valid_from">
                {(field) => (
                  <DateTimeInput
                    label={t`Valid From`}
                    onChange={(e) => field.handleChange(e && formatISO(e, { in: utc }))}
                    valueFormat="YYYY-MM-DD HH:mm:ss ZZ"
                    clearable
                    value={field.state.value && new Date(field.state.value)}
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                  />
                )}
              </form.Field>
              <form.Field name="valid_until">
                {(field) => (
                  <DateTimeInput
                    label={t`Valid Until`}
                    onChange={(e) => field.handleChange(e && formatISO(e, { in: utc }))}
                    valueFormat="YYYY-MM-DD HH:mm:ss ZZ"
                    clearable
                    value={field.state.value && new Date(field.state.value)}
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                  />
                )}
              </form.Field>
            </Group>
            <form.Field name="raw_route">
              {(field) => (
                <Textarea
                  label={t`Route`}
                  onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  disabled={isLoading}
                  autosize
                  minRows={5}
                />
              )}
            </form.Field>
            <form.Field name="cruising_level_restriction">
              {(field) => (
                <Select
                  label={t`Cruising Level Type`}
                  placeholder="Pick value"
                  data={Object.entries(CRUISE_LEVELS).map(([value, msg]) => ({ value, label: i18n._(msg) }))}
                  onChange={(value) =>
                    value && field.handleChange(value as components["schemas"]["LevelRestrictionType"])
                  }
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  disabled={isLoading}
                />
              )}
            </form.Field>
            <form.Field name="remarks">
              {(field) => (
                <Textarea
                  label={t`Description`}
                  onChange={(e) => field.handleChange(e.target.value)}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  disabled={true}
                  autosize
                  minRows={5}
                />
              )}
            </form.Field>
            <Group>
              <Button variant="subtle" type="submit" loading={isCreatePending || isUpdatePending}>
                {id ? t`Save` : t`Create`}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
};
