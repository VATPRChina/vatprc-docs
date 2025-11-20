import { DateTime } from "./datetime";
import NoEventImage from "@/assets/no-event-image.svg";
import { $api, useUser } from "@/lib/client";
import { promiseWithLog, promiseWithToast } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Button, Group, Image, Modal, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { formatISO, setMinutes, setSeconds } from "date-fns";
import { TbEdit } from "react-icons/tb";

const NULL_ULID = "01J2N4V2BNSP3E5Q9MBA3AE8E3";
export const CreateEvent = ({ eventId }: { eventId?: string }) => {
  const { t } = useLingui();
  const [opened, { toggle, close }] = useDisclosure(false);

  const user = useUser();
  const queryClient = useQueryClient();
  const { data: event, isLoading } = $api.useQuery(
    "get",
    "/api/events/{eid}",
    { params: { path: { eid: eventId ?? NULL_ULID } } },
    { enabled: !!eventId && opened },
  );
  const title = event?.title;
  const { mutate: create, isPending: isCreatePending } = $api.useMutation("post", "/api/events", {
    onSuccess: () => {
      close();
      promiseWithLog(queryClient.invalidateQueries({ queryKey: $api.queryOptions("get", "/api/events").queryKey }));
    },
  });
  const { mutate: update, isPending: isUpdatePending } = $api.useMutation("post", "/api/events/{eid}", {
    onSuccess: () => close(),
  });
  const form = useForm({
    defaultValues: {
      title: event?.title ?? "",
      start_at: event?.start_at ?? formatISO(setMinutes(setSeconds(Date.now(), 0), 0)),
      end_at: event?.end_at ?? formatISO(setMinutes(setSeconds(Date.now(), 0), 0)),
      start_booking_at: event?.start_booking_at ?? formatISO(setMinutes(setSeconds(Date.now(), 0), 0)),
      end_booking_at: event?.end_booking_at ?? formatISO(setMinutes(setSeconds(Date.now(), 0), 0)),
      image_url: event?.image_url ?? null,
      description: event?.description ?? "",
    },
    onSubmit: ({ value }) => {
      if (eventId) {
        update({ params: { path: { eid: eventId ?? NULL_ULID } }, body: value });
      } else {
        create({ body: value });
      }
    },
  });

  if (!user?.roles.includes("event-coordinator")) return null;

  return (
    <>
      {eventId ? (
        <ActionIcon variant="subtle" aria-label={t`Edit Event {title}`} onClick={toggle}>
          <TbEdit size={18} />
        </ActionIcon>
      ) : (
        <Button onClick={toggle}>
          <Trans>Create Event</Trans>
        </Button>
      )}
      <Modal opened={opened} onClose={close} size="xl" title={eventId ? t`Edit Event ${title}` : t`Create Event`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            promiseWithToast(form.handleSubmit());
          }}
        >
          <Stack>
            <form.Field name="title">
              {(field) => (
                <TextInput
                  label={t`Title`}
                  onChange={(e) => field.handleChange(e.target.value)}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  disabled={isLoading}
                ></TextInput>
              )}
            </form.Field>
            <Group grow>
              <form.Field name="start_at">
                {(field) => (
                  <Stack gap="xs">
                    <DateTimePicker
                      label={t`Start at`}
                      onChange={(e) => field.handleChange(formatISO(e ?? new Date(), { in: utc }))}
                      valueFormat="YYYY-MM-DD HH:mm:ss ZZ"
                      value={new Date(field.state.value)}
                      onBlur={field.handleBlur}
                      disabled={isLoading}
                    />
                    <Text size="xs">
                      <DateTime>{field.state.value}</DateTime>
                    </Text>
                  </Stack>
                )}
              </form.Field>
              <form.Field name="end_at">
                {(field) => (
                  <Stack gap="xs">
                    <DateTimePicker
                      label={t`End at`}
                      onChange={(e) => field.handleChange(formatISO(e ?? new Date(), { in: utc }))}
                      valueFormat="YYYY-MM-DD HH:mm:ss ZZ"
                      value={new Date(field.state.value)}
                      onBlur={field.handleBlur}
                      disabled={isLoading}
                    />
                    <Text size="xs">
                      <DateTime>{field.state.value}</DateTime>
                    </Text>
                  </Stack>
                )}
              </form.Field>
            </Group>
            <Group grow>
              <form.Field name="start_booking_at">
                {(field) => (
                  <Stack gap="xs">
                    <DateTimePicker
                      label={t`Start booking at`}
                      onChange={(e) => field.handleChange(formatISO(e ?? new Date(), { in: utc }))}
                      valueFormat="YYYY-MM-DD HH:mm:ss ZZ"
                      value={new Date(field.state.value)}
                      onBlur={field.handleBlur}
                      disabled={isLoading}
                    />
                    <Text size="xs">
                      <DateTime>{field.state.value}</DateTime>
                    </Text>
                  </Stack>
                )}
              </form.Field>
              <form.Field name="end_booking_at">
                {(field) => (
                  <Stack gap="xs">
                    <DateTimePicker
                      label={t`End booking at`}
                      onChange={(e) => field.handleChange(formatISO(e ?? new Date(), { in: utc }))}
                      valueFormat="YYYY-MM-DD HH:mm:ss ZZ"
                      value={new Date(field.state.value)}
                      onBlur={field.handleBlur}
                      disabled={isLoading}
                    />
                    <Text size="xs">
                      <DateTime>{field.state.value}</DateTime>
                    </Text>
                  </Stack>
                )}
              </form.Field>
            </Group>
            <form.Field name="image_url">
              {(field) => (
                <TextInput
                  label={t`Image URL`}
                  onChange={(e) => field.handleChange(e.target.value || null)}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  disabled={isLoading}
                />
              )}
            </form.Field>
            <form.Subscribe selector={(state) => state.values.image_url}>
              {(image_url) => <Image src={image_url ?? NoEventImage} />}
            </form.Subscribe>
            <form.Field name="description">
              {(field) => (
                <Textarea
                  label={t`Description`}
                  onChange={(e) => field.handleChange(e.target.value)}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  disabled={isLoading}
                  autosize
                  minRows={5}
                />
              )}
            </form.Field>
            <Group>
              <Button variant="subtle" type="submit" loading={isCreatePending || isUpdatePending}>
                {eventId ? t`Save` : t`Create`}
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
};
