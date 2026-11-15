import { DateTime } from "../event/datetime";
import { ConfirmButton } from "../ui/confirm-button";
import { DateTimeInput } from "../ui/datetime-input";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { promiseWithLog, wrapPromiseWithLog } from "@/lib/utils";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Anchor, Badge, Button, Card, Modal, Skeleton, Textarea, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { addHours, formatISO } from "date-fns";
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
  const queryClient = useQueryClient();
  const { mutate, isPending, error } = $api.useMutation("delete", "/api/atc/bookings/{id}", {
    onSuccess: wrapPromiseWithLog(() => invalidateBookings(queryClient)),
  });
  const callsign = booking.callsign;
  const cancel = () => mutate({ params: { path: { id: booking.id } } });

  return (
    <>
      <ConfirmButton
        actionDescription={<Trans>Cancel the booking for {callsign}?</Trans>}
        color="red"
        variant="subtle"
        size="compact-sm"
        leftSection={<TbTrash />}
        onClick={cancel}
        loading={isPending}
      >
        <Trans>Cancel</Trans>
      </ConfirmButton>
      {error && <span className="text-sm text-red-700 dark:text-red-300">{error.detail}</span>}
    </>
  );
};

export const MyAtcBookings: FC = () => {
  const { i18n } = useLingui();
  const { data, error, isLoading } = $api.useQuery("get", "/api/atc/bookings/mine/upcoming");

  return (
    <section className="flex flex-col gap-2">
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
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((booking) => {
            const event = booking.event_position?.event;
            const eventTitle = event && (i18n.locale === "en" ? (event.title_en ?? event.title) : event.title);
            return (
              <Card key={booking.id} withBorder className="flex flex-col items-start gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-base font-bold">{booking.callsign}</span>
                  {event && (
                    <Badge variant="light" color="gray">
                      <Trans>Event</Trans>
                    </Badge>
                  )}
                </div>
                <DateTime>{booking.start_at}</DateTime>
                <DateTime>{booking.end_at}</DateTime>
                {booking.remarks && <p className="text-sm text-gray-700 dark:text-gray-300">{booking.remarks}</p>}
                {event && (
                  <Anchor
                    renderRoot={(props) => <Link to="/events/$id" params={{ id: event.id }} {...props} />}
                    size="sm"
                  >
                    {eventTitle}
                  </Anchor>
                )}
                {!event && (
                  <div className="flex flex-wrap items-center gap-1">
                    <BookingModal booking={booking} />
                    <CancelBookingButton booking={booking} />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};
