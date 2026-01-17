import { DateTimeInput } from "../ui/datetime-input";
import NoEventImage from "@/assets/no-event-image.svg";
import { components } from "@/lib/api";
import { $api, useUser } from "@/lib/client";
import { promiseWithLog, promiseWithToast, wrapPromiseWithLog } from "@/lib/utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { ActionIcon, Button, Group, Image, Modal, Stack, TextInput, Textarea } from "@mantine/core";
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
      body: form as unknown as { image: string },
    });
  };

  const { mutateAsync: create } = $api.useMutation("post", "/api/events", {
    onSuccess: () => {
      close();
      promiseWithLog(() => queryClient.invalidateQueries($api.queryOptions("get", "/api/events")));
    },
  });
  const { mutateAsync: update } = $api.useMutation("post", "/api/events/{eid}", {
    onSuccess: wrapPromiseWithLog(async () => {
      close();
      if (eventId) {
        await queryClient.invalidateQueries(
          $api.queryOptions("get", "/api/events/{eid}", { params: { path: { eid: eventId } } }),
        );
      }
    }),
  });
  const now = formatISO(setMinutes(setSeconds(addHours(Date.now(), 1), 0), 0));
  const form = useForm({
    defaultValues: {
      title: event?.title ?? "",
      title_en: event?.title_en ?? null,
      start_at: event?.start_at ?? now,
      end_at: event?.end_at ?? now,
      start_booking_at: event?.start_booking_at,
      end_booking_at: event?.end_booking_at,
      start_atc_booking_at: event?.start_atc_booking_at,
      image_url: event?.image_url ?? null,
      community_link: event?.community_link ?? null,
      vatsim_link: event?.vatsim_link ?? null,
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
                />
              )}
            </form.Field>
            <form.Field name="title_en">
              {(field) => (
                <TextInput
                  label={t`Title (English)`}
                  onChange={(e) => field.handleChange(e.target.value)}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  disabled={isLoading}
                  error={field.state.meta.errors.join("")}
                />
              )}
            </form.Field>
            <Group grow>
              <form.Field name="start_at">
                {(field) => (
                  <DateTimeInput
                    label={t`Start at`}
                    onChange={(e) => e && field.handleChange(e)}
                    value={new Date(field.state.value)}
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                    error={field.state.meta.errors.join("")}
                  />
                )}
              </form.Field>
              <form.Field name="end_at">
                {(field) => (
                  <DateTimeInput
                    label={t`End at`}
                    onChange={(e) => e && field.handleChange(e)}
                    value={new Date(field.state.value)}
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                    error={field.state.meta.errors.join("")}
                  />
                )}
              </form.Field>
            </Group>
            <Group grow>
              <form.Field name="start_booking_at">
                {(field) => (
                  <DateTimeInput
                    label={t`Start booking at`}
                    placeholder={t`Booking not supported`}
                    onChange={(e) => field.handleChange(e)}
                    value={field.state.value && new Date(field.state.value)}
                    clearable
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                    error={field.state.meta.errors.join("")}
                  />
                )}
              </form.Field>
              <form.Field name="end_booking_at">
                {(field) => (
                  <DateTimeInput
                    label={t`End booking at`}
                    placeholder={t`Booking not supported`}
                    onChange={(e) => field.handleChange(e)}
                    value={field.state.value && new Date(field.state.value)}
                    clearable
                    onBlur={field.handleBlur}
                    disabled={isLoading}
                    error={field.state.meta.errors.join("")}
                  />
                )}
              </form.Field>
            </Group>
            <form.Field name="start_atc_booking_at">
              {(field) => (
                <DateTimeInput
                  label={t`Start ATC booking at`}
                  placeholder={t`Start immediately`}
                  onChange={(e) => field.handleChange(e)}
                  value={field.state.value && new Date(field.state.value)}
                  onBlur={field.handleBlur}
                  disabled={isLoading}
                  clearable
                  error={field.state.meta.errors.join("")}
                />
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
            <form.Field name="community_link">
              {(field) => (
                <TextInput
                  label={t`Forum`}
                  onChange={(e) => field.handleChange(e.target.value)}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  disabled={isLoading}
                  error={field.state.meta.errors.join("")}
                />
              )}
            </form.Field>
            <form.Field name="vatsim_link">
              {(field) => (
                <TextInput
                  label={t`VATSIM`}
                  onChange={(e) => field.handleChange(e.target.value)}
                  value={field.state.value ?? ""}
                  onBlur={field.handleBlur}
                  disabled={isLoading}
                  error={field.state.meta.errors.join("")}
                />
              )}
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
