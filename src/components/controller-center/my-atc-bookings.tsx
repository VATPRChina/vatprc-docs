import { DateTimeInput } from "../ui/datetime-input";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { promiseWithLog, wrapPromiseWithLog } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Badge, Button, Modal, Skeleton, Textarea, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { addHours, format, formatISO } from "date-fns";
import { FC, SubmitEvent } from "react";
import { TbEdit, TbPlus, TbTrash } from "react-icons/tb";

type Booking = components["schemas"]["AtcBookingDto"];
type BookingSave = components["schemas"]["AtcBookingSaveRequest"];

const bookingValues = (booking?: Booking): BookingSave => ({
  callsign: booking?.callsign ?? "",
  start_at: booking?.start_at ?? formatISO(new Date(), { in: utc }),
  end_at: booking?.end_at ?? formatISO(addHours(new Date(), 2), { in: utc }),
  remarks: booking?.remarks ?? "",
});

const invalidateBookings = async (queryClient: ReturnType<typeof useQueryClient>) => {
  await Promise.all([
    queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/bookings/upcoming")),
    queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/bookings/mine/upcoming")),
    queryClient.invalidateQueries($api.queryOptions("get", "/api/compat/online-status")),
  ]);
};

const BookingModal: FC<{ booking?: Booking }> = ({ booking }) => {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const [opened, { open, close }] = useDisclosure(false);
  const onSuccess = wrapPromiseWithLog(async () => {
    close();
    await invalidateBookings(queryClient);
  });
  const {
    mutate: create,
    isPending: isCreating,
    error: createError,
  } = $api.useMutation("put", "/api/atc/bookings", { onSuccess });
  const {
    mutate: update,
    isPending: isUpdating,
    error: updateError,
  } = $api.useMutation("put", "/api/atc/bookings/{id}", { onSuccess });

  const form = useForm({
    defaultValues: bookingValues(booking),
    onSubmit: ({ value }) => {
      if (booking) {
        update({ params: { path: { id: booking.id } }, body: value });
      } else {
        create({ body: value });
      }
    },
    validators: {
      onSubmit: ({ value }) => {
        const errors: Record<string, string> = {};
        if (!value.callsign.trim()) errors.callsign = t`Callsign is required`;
        if (!value.start_at) errors.start_at = t`Start time is required`;
        if (!value.end_at) errors.end_at = t`End time is required`;
        if (value.start_at && value.end_at && new Date(value.start_at) >= new Date(value.end_at)) {
          errors.end_at = t`End time must be after start time`;
        }
        return { fields: errors };
      },
    },
  });

  const onSubmit = (event: SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    event.stopPropagation();
    promiseWithLog(form.handleSubmit());
  };

  return (
    <>
      {booking ? (
        <Button variant="subtle" size="compact-sm" leftSection={<TbEdit />} onClick={open}>
          <Trans>Edit</Trans>
        </Button>
      ) : (
        <Button variant="outline" leftSection={<TbPlus />} onClick={open}>
          <Trans>Book ATC Position</Trans>
        </Button>
      )}
      <Modal opened={opened} onClose={close} title={booking ? t`Edit ATC Booking` : t`Book ATC Position`} size="lg">
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {(createError ?? updateError) && (
            <Alert color="red" title={(createError ?? updateError)?.title}>
              {(createError ?? updateError)?.detail}
            </Alert>
          )}
          <form.Field name="callsign">
            {(field) => (
              <TextInput
                label={t`Callsign`}
                placeholder="ZBAA_TWR"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.currentTarget.value.toUpperCase())}
                onBlur={field.handleBlur}
                error={field.state.meta.errors.join("")}
                required
              />
            )}
          </form.Field>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <form.Field name="start_at">
              {(field) => (
                <DateTimeInput
                  label={t`Start at`}
                  value={field.state.value ? new Date(field.state.value) : null}
                  onChange={(value) => value && field.handleChange(formatISO(value, { in: utc }))}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.join("")}
                  required
                />
              )}
            </form.Field>
            <form.Field name="end_at">
              {(field) => (
                <DateTimeInput
                  label={t`End at`}
                  value={field.state.value ? new Date(field.state.value) : null}
                  onChange={(value) => value && field.handleChange(formatISO(value, { in: utc }))}
                  onBlur={field.handleBlur}
                  error={field.state.meta.errors.join("")}
                  required
                />
              )}
            </form.Field>
          </div>
          <form.Field name="remarks">
            {(field) => (
              <Textarea
                label={t`Remarks`}
                value={field.state.value ?? ""}
                onChange={(event) => field.handleChange(event.currentTarget.value)}
                onBlur={field.handleBlur}
                autosize
                minRows={2}
              />
            )}
          </form.Field>
          <div>
            <Button type="submit" loading={isCreating || isUpdating}>
              {booking ? <Trans>Save</Trans> : <Trans>Book</Trans>}
            </Button>
          </div>
        </form>
      </Modal>
    </>
  );
};

const CancelBookingButton: FC<{ booking: Booking }> = ({ booking }) => {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = $api.useMutation("delete", "/api/atc/bookings/{id}", {
    onSuccess: wrapPromiseWithLog(() => invalidateBookings(queryClient)),
  });
  const cancel = () => {
    const callsign = booking.callsign;
    if (window.confirm(t`Cancel the booking for ${callsign}?`)) {
      mutate({ params: { path: { id: booking.id } } });
    }
  };
  return (
    <>
      <Button
        color="red"
        variant="subtle"
        size="compact-sm"
        leftSection={<TbTrash />}
        onClick={cancel}
        loading={isPending}
      >
        <Trans>Cancel</Trans>
      </Button>
      {error && <span className="text-sm text-red-700 dark:text-red-300">{error.detail}</span>}
    </>
  );
};

export const MyAtcBookings: FC = () => {
  const { i18n } = useLingui();
  const { data, error, isLoading } = $api.useQuery("get", "/api/atc/bookings/mine/upcoming");

  return (
    <section className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-2xl font-medium">
          <Trans>My ATC Bookings</Trans>
        </h2>
        <BookingModal />
      </div>
      {isLoading && <Skeleton h={96} />}
      {error && (
        <Alert color="red" title={error.title}>
          {error.detail}
        </Alert>
      )}
      {data && data.length === 0 && (
        <div className="border border-black/15 px-4 py-6 font-mono text-gray-600 dark:border-white/20 dark:text-gray-300">
          <Trans>You have no upcoming ATC bookings.</Trans>
        </div>
      )}
      {data && data.length > 0 && (
        <div className="border border-black/15 dark:border-white/20">
          {data.map((booking) => {
            const event = booking.event_position?.event;
            const eventTitle = event && (i18n.locale === "en" ? (event.title_en ?? event.title) : event.title);
            return (
              <div
                key={booking.id}
                className="flex flex-wrap items-center gap-3 border-b border-l-3 border-black/15 border-l-emerald-600 px-4 py-3 last:border-b-0 dark:border-white/20 dark:border-l-emerald-400"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-base font-bold">{booking.callsign}</span>
                    {event && (
                      <Badge variant="light" color="gray">
                        <Trans>Event</Trans>
                      </Badge>
                    )}
                  </div>
                  <div className="font-mono text-sm text-gray-600 dark:text-gray-400">
                    {format(booking.start_at, "yyyy-MM-dd HHmm", { in: utc })}Z–
                    {format(booking.end_at, "yyyy-MM-dd HHmm", { in: utc })}Z
                  </div>
                  {booking.remarks && (
                    <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{booking.remarks}</p>
                  )}
                  {event && (
                    <Link to="/events/$id" params={{ id: event.id }} className="text-vatprc text-sm hover:underline">
                      {eventTitle}
                    </Link>
                  )}
                </div>
                {!event && (
                  <div className="flex flex-wrap items-center gap-1">
                    <BookingModal booking={booking} />
                    <CancelBookingButton booking={booking} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
