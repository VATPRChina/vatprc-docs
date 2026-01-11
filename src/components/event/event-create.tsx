import { DateTime } from "./datetime";
import NoEventImage from "@/assets/no-event-image.svg";
import { components } from "@/lib/api";
import { $api, useUser } from "@/lib/client";
import { promiseWithLog, promiseWithToast } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Button, Group, Image, Modal, Stack, Text, TextInput, Textarea } from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { Dropzone, IMAGE_MIME_TYPE } from "@mantine/dropzone";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { addHours, formatISO, setMinutes, setSeconds } from "date-fns";
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

  const { mutate: uploadImage, isPending: isImageUploading } = $api.useMutation("post", "/api/storage/images", {
    onSuccess: (data) => form.setFieldValue("image_url", data.url),
  });
  const onUpload = (files: File[]) => {
    if (!files || files.length !== 1) return;
    const file = files[0];
    const form = new FormData();
    form.append("image", file, file?.name ?? "untitled");
    uploadImage({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      body: form as any,
    });
  };

  const { mutateAsync: create } = $api.useMutation("post", "/api/events", {
    onSuccess: () => {
      close();
      promiseWithLog(queryClient.invalidateQueries({ queryKey: $api.queryOptions("get", "/api/events").queryKey }));
    },
  });
  const { mutateAsync: update } = $api.useMutation("post", "/api/events/{eid}", {
    onSuccess: () => close(),
  });
  const now = formatISO(setMinutes(setSeconds(addHours(Date.now(), 1), 0), 0));
  const form = useForm({
    defaultValues: {
      title: event?.title ?? "",
      start_at: event?.start_at ?? now,
      end_at: event?.end_at ?? now,
      start_booking_at: event?.start_booking_at,
      end_booking_at: event?.end_booking_at,
      start_atc_booking_at: event?.start_atc_booking_at,
      image_url: event?.image_url ?? null,
      description: event?.description ?? "",
    } satisfies components["schemas"]["EventSaveRequest"],
    onSubmit: ({ value }) => {
      if (eventId) {
        return update({ params: { path: { eid: eventId ?? NULL_ULID } }, body: value });
      } else {
        return create({ body: value });
      }
    },
    validators: {
      onSubmit: ({ value }) => {
        const fields: Record<string, string> = {};
        if (!value.title) {
          fields["title"] = t`Title is required`;
        }
        if (new Date(value.start_at) >= new Date(value.end_at)) {
          fields["end_at"] = t`End time must be after start time`;
        }
        if (value.start_booking_at && value.end_booking_at) {
          if (new Date(value.start_booking_at) >= new Date(value.end_booking_at)) {
            fields["end_booking_at"] = t`End booking time must be after start booking time`;
          }
        } else if (!value.start_booking_at || !value.end_booking_at) {
          // ignore
        } else {
          fields["start_booking_at"] = t`Start and End booking time must be both set or unset`;
          fields["end_booking_at"] = t`Start and End booking time must be both set or unset`;
        }
        return { fields };
      },
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
                  error={field.state.meta.errors.join("")}
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
                      error={field.state.meta.errors.join("")}
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
                      error={field.state.meta.errors.join("")}
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
                      placeholder={t`Booking not supported`}
                      onChange={(e) => field.handleChange(e && formatISO(e ?? new Date(), { in: utc }))}
                      valueFormat="YYYY-MM-DD HH:mm:ss ZZ"
                      value={field.state.value && new Date(field.state.value)}
                      clearable
                      onBlur={field.handleBlur}
                      disabled={isLoading}
                      error={field.state.meta.errors.join("")}
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
                      placeholder={t`Booking not supported`}
                      onChange={(e) => field.handleChange(e && formatISO(e ?? new Date(), { in: utc }))}
                      valueFormat="YYYY-MM-DD HH:mm:ss ZZ"
                      value={field.state.value && new Date(field.state.value)}
                      clearable
                      onBlur={field.handleBlur}
                      disabled={isLoading}
                      error={field.state.meta.errors.join("")}
                    />
                    <Text size="xs">
                      <DateTime>{field.state.value}</DateTime>
                    </Text>
                  </Stack>
                )}
              </form.Field>
            </Group>
            <form.Field name="start_atc_booking_at">
              {(field) => (
                <Stack gap="xs">
                  <DateTimePicker
                    label={t`Start ATC booking at`}
                    placeholder={t`Start immediately`}
                    onChange={(e) => field.handleChange(e && formatISO(e, { in: utc }))}
                    valueFormat="YYYY-MM-DD HH:mm:ss ZZ"
                    value={field.state.value && new Date(field.state.value)}
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                    clearable
                    error={field.state.meta.errors.join("")}
                  />
                  <Text size="xs">
                    <DateTime>{field.state.value}</DateTime>
                  </Text>
                </Stack>
              )}
            </form.Field>
            <Dropzone onDrop={onUpload} accept={IMAGE_MIME_TYPE} loading={isImageUploading}>
              <form.Subscribe selector={(state) => state.values.image_url}>
                {(image_url) => <Image src={image_url ?? NoEventImage} />}
              </form.Subscribe>
            </Dropzone>
            <form.Field name="image_url">
              {(field) => <TextInput label={t`Image URL`} value={field.state.value ?? ""} disabled />}
            </form.Field>
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
                  error={field.state.meta.errors.join("")}
                />
              )}
            </form.Field>
            <div>
              <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                  <Button variant="subtle" type="submit" loading={isSubmitting} disabled={!canSubmit}>
                    {eventId ? t`Save` : t`Create`}
                  </Button>
                )}
              </form.Subscribe>
            </div>
          </Stack>
        </form>
      </Modal>
    </>
  );
};
