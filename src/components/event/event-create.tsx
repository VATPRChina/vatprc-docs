import { DateTimeInput } from "../ui/datetime-input";
import NoEventImage from "@/assets/no-event-image.svg";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { components } from "@/lib/api";
import { $api, useUser } from "@/lib/client";
import { promiseWithLog, wrapPromiseWithLog } from "@/lib/helpers";
import { Trans, useLingui } from "@lingui/react/macro";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { addHours, formatISO, setMinutes, setSeconds } from "date-fns";
import { useState as useDisclosureState } from "react";
import { TbEdit } from "react-icons/tb";

const NULL_ULID = "01J2N4V2BNSP3E5Q9MBA3AE8E3";
export const CreateEvent = ({ eventId }: { eventId?: string }) => {
  const { t } = useLingui();
  const [opened, setOpened] = useDisclosureState(false);
  const toggle = () => setOpened((value) => !value);
  const close = () => setOpened(false);

  const user = useUser();
  const queryClient = useQueryClient();
  const {
    data: event,
    error: loadError,
    isLoading,
  } = $api.useQuery(
    "get",
    "/api/events/{id}",
    { params: { path: { id: eventId ?? NULL_ULID } } },
    { enabled: !!eventId && opened },
  );
  const title = event?.title;

  const {
    mutate: uploadImage,
    isPending: isImageUploading,
    error: uploadError,
  } = $api.useMutation("post", "/api/storage/images", {
    onSuccess: (data) => form.setFieldValue("image_url", data.url),
  });
  const onUpload = (files: File[]) => {
    if (!files || files.length !== 1) return;
    const file = files[0];
    const form = new FormData();
    form.append("image", file, file?.name ?? "untitled");
    uploadImage({
      body: form as unknown as string,
    });
  };

  const { mutateAsync: create, error: createError } = $api.useMutation("post", "/api/events", {
    onSuccess: () => {
      close();
      promiseWithLog(() => queryClient.invalidateQueries($api.queryOptions("get", "/api/events")));
    },
  });
  const { mutateAsync: update, error: updateError } = $api.useMutation("put", "/api/events/{id}", {
    onSuccess: wrapPromiseWithLog(async () => {
      close();
      if (eventId) {
        await queryClient.invalidateQueries(
          $api.queryOptions("get", "/api/events/{id}", { params: { path: { id: eventId } } }),
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
        return update({ params: { path: { id: eventId ?? NULL_ULID } }, body: value });
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
        <Button aria-label={t`Edit Event {title}`} onClick={toggle} size={"icon-sm"} variant={"neutral"}>
          <TbEdit size={18} />
        </Button>
      ) : (
        <Button onClick={toggle}>
          <Trans>Create Event</Trans>
        </Button>
      )}
      <Dialog
        open={opened}
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{eventId ? t`Edit Event ${title}` : t`Create Event`}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              promiseWithLog(form.handleSubmit());
            }}
          >
            <div className="flex flex-col gap-4">
              {(loadError ?? uploadError ?? createError ?? updateError) && (
                <Alert variant={"destructive"}>
                  <AlertTitle>{(loadError ?? uploadError ?? createError ?? updateError)?.title}</AlertTitle>
                  <AlertDescription>
                    {(loadError ?? uploadError ?? createError ?? updateError)?.detail}
                  </AlertDescription>
                </Alert>
              )}
              <form.Field name="title">
                {(field) => (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-heading">{t`Title`}</span>
                    <Input
                      aria-label={t`Title`}
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      disabled={isLoading}
                      aria-invalid={!!field.state.meta.errors.join("")}
                    />
                    {field.state.meta.errors.join("") && (
                      <span role="alert" className="text-xs text-red-600">
                        {field.state.meta.errors.join("")}
                      </span>
                    )}
                  </label>
                )}
              </form.Field>
              <form.Field name="title_en">
                {(field) => (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-heading">{t`Title (English)`}</span>
                    <Input
                      aria-label={t`Title (English)`}
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      disabled={isLoading}
                      aria-invalid={!!field.state.meta.errors.join("")}
                    />
                    {field.state.meta.errors.join("") && (
                      <span role="alert" className="text-xs text-red-600">
                        {field.state.meta.errors.join("")}
                      </span>
                    )}
                  </label>
                )}
              </form.Field>
              <div className="grid grid-cols-2 gap-2">
                <form.Field name="start_at">
                  {(field) => (
                    <label className="grid gap-1.5 text-sm">
                      <span className="font-heading">{t`Start at`}</span>
                      <DateTimeInput
                        aria-label={t`Start at`}
                        onChange={(e) => e && field.handleChange(e)}
                        value={new Date(field.state.value)}
                        onBlur={field.handleBlur}
                        disabled={isLoading}
                        aria-invalid={!!field.state.meta.errors.join("")}
                      />
                      {field.state.meta.errors.join("") && (
                        <span role="alert" className="text-xs text-red-600">
                          {field.state.meta.errors.join("")}
                        </span>
                      )}
                    </label>
                  )}
                </form.Field>
                <form.Field name="end_at">
                  {(field) => (
                    <label className="grid gap-1.5 text-sm">
                      <span className="font-heading">{t`End at`}</span>
                      <DateTimeInput
                        aria-label={t`End at`}
                        onChange={(e) => e && field.handleChange(e)}
                        value={new Date(field.state.value)}
                        onBlur={field.handleBlur}
                        disabled={isLoading}
                        aria-invalid={!!field.state.meta.errors.join("")}
                      />
                      {field.state.meta.errors.join("") && (
                        <span role="alert" className="text-xs text-red-600">
                          {field.state.meta.errors.join("")}
                        </span>
                      )}
                    </label>
                  )}
                </form.Field>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <form.Field name="start_booking_at">
                  {(field) => (
                    <label className="grid gap-1.5 text-sm">
                      <span className="font-heading">{t`Start booking at`}</span>
                      <DateTimeInput
                        aria-label={t`Start booking at`}
                        placeholder={t`Booking not supported`}
                        onChange={(e) => field.handleChange(e)}
                        value={field.state.value && new Date(field.state.value)}
                        onBlur={field.handleBlur}
                        disabled={isLoading}
                        aria-invalid={!!field.state.meta.errors.join("")}
                      />
                      {field.state.meta.errors.join("") && (
                        <span role="alert" className="text-xs text-red-600">
                          {field.state.meta.errors.join("")}
                        </span>
                      )}
                    </label>
                  )}
                </form.Field>
                <form.Field name="end_booking_at">
                  {(field) => (
                    <label className="grid gap-1.5 text-sm">
                      <span className="font-heading">{t`End booking at`}</span>
                      <DateTimeInput
                        aria-label={t`End booking at`}
                        placeholder={t`Booking not supported`}
                        onChange={(e) => field.handleChange(e)}
                        value={field.state.value && new Date(field.state.value)}
                        onBlur={field.handleBlur}
                        disabled={isLoading}
                        aria-invalid={!!field.state.meta.errors.join("")}
                      />
                      {field.state.meta.errors.join("") && (
                        <span role="alert" className="text-xs text-red-600">
                          {field.state.meta.errors.join("")}
                        </span>
                      )}
                    </label>
                  )}
                </form.Field>
              </div>
              <form.Field name="start_atc_booking_at">
                {(field) => (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-heading">{t`Start ATC booking at`}</span>
                    <DateTimeInput
                      aria-label={t`Start ATC booking at`}
                      placeholder={t`Start immediately`}
                      onChange={(e) => field.handleChange(e)}
                      value={field.state.value && new Date(field.state.value)}
                      onBlur={field.handleBlur}
                      disabled={isLoading}
                      aria-invalid={!!field.state.meta.errors.join("")}
                    />
                    {field.state.meta.errors.join("") && (
                      <span role="alert" className="text-xs text-red-600">
                        {field.state.meta.errors.join("")}
                      </span>
                    )}
                  </label>
                )}
              </form.Field>
              <div>
                <Input
                  type="file"
                  accept="image/*"
                  aria-label={t`Upload image`}
                  disabled={isImageUploading}
                  onChange={(event) => onUpload(Array.from(event.currentTarget.files ?? []))}
                />
                <form.Subscribe selector={(state) => state.values.image_url}>
                  {(image_url) => <img src={image_url ?? NoEventImage} alt={""} className={"w-full"} />}
                </form.Subscribe>
              </div>
              <form.Field name="image_url">
                {(field) => (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-heading">{t`Image URL`}</span>
                    <Input aria-label={t`Image URL`} value={field.state.value ?? ""} disabled />
                  </label>
                )}
              </form.Field>
              <form.Field name="community_link">
                {(field) => (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-heading">{t`Forum`}</span>
                    <Input
                      aria-label={t`Forum`}
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      disabled={isLoading}
                      aria-invalid={!!field.state.meta.errors.join("")}
                    />
                    {field.state.meta.errors.join("") && (
                      <span role="alert" className="text-xs text-red-600">
                        {field.state.meta.errors.join("")}
                      </span>
                    )}
                  </label>
                )}
              </form.Field>
              <form.Field name="vatsim_link">
                {(field) => (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-heading">{t`VATSIM`}</span>
                    <Input
                      aria-label={t`VATSIM`}
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      disabled={isLoading}
                      aria-invalid={!!field.state.meta.errors.join("")}
                    />
                    {field.state.meta.errors.join("") && (
                      <span role="alert" className="text-xs text-red-600">
                        {field.state.meta.errors.join("")}
                      </span>
                    )}
                  </label>
                )}
              </form.Field>
              <form.Field name="description">
                {(field) => (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-heading">{t`Description`}</span>
                    <Textarea
                      aria-label={t`Description`}
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      disabled={isLoading}
                      aria-invalid={!!field.state.meta.errors.join("")}
                      rows={5}
                    />
                    {field.state.meta.errors.join("") && (
                      <span role="alert" className="text-xs text-red-600">
                        {field.state.meta.errors.join("")}
                      </span>
                    )}
                  </label>
                )}
              </form.Field>
              <div>
                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      disabled={!canSubmit || isSubmitting}
                      aria-busy={isSubmitting}
                      variant={"neutral"}
                    >
                      {eventId ? t`Save` : t`Create`}
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
