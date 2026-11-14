import { DateTime } from "../event/datetime";
import { ConfirmButton } from "../ui/confirm-button";
import { DateTimeInput } from "../ui/datetime-input";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { components } from "@/lib/api";
import { $api } from "@/lib/client";
import { promiseWithLog, wrapPromiseWithLog } from "@/lib/helpers";
import { utc } from "@date-fns/utc";
import { Trans, useLingui } from "@lingui/react/macro";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { addHours, formatISO } from "date-fns";
import { useState as useDisclosureState } from "react";
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
  const [opened, setOpened] = useDisclosureState(false);
  const open = () => setOpened(true);
  const close = () => setOpened(false);
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
        <Button onClick={open} variant={"neutral"} size={"sm"}>
          {<TbEdit />}
          <Trans>Edit</Trans>
        </Button>
      ) : (
        <Button onClick={open} variant={"neutral"}>
          {<TbPlus />}
          <Trans>Book ATC Position</Trans>
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
            <DialogTitle>{booking ? t`Edit ATC Booking` : t`Book ATC Position`}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {(createError ?? updateError) && (
              <Alert variant={"destructive"}>
                <AlertTitle>{(createError ?? updateError)?.title}</AlertTitle>
                <AlertDescription>{(createError ?? updateError)?.detail}</AlertDescription>
              </Alert>
            )}
            <form.Field name="callsign">
              {(field) => (
                <label className="grid gap-1.5 text-sm">
                  <span className="font-heading">{t`Callsign`}</span>
                  <Input
                    aria-label={t`Callsign`}
                    placeholder="ZBAA_TWR"
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.currentTarget.value.toUpperCase())}
                    onBlur={field.handleBlur}
                    required
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
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <form.Field name="start_at">
                {(field) => (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-heading">{t`Start at`}</span>
                    <DateTimeInput
                      aria-label={t`Start at`}
                      value={field.state.value ? new Date(field.state.value) : null}
                      onChange={(value) => value && field.handleChange(formatISO(value, { in: utc }))}
                      onBlur={field.handleBlur}
                      required
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
                      value={field.state.value ? new Date(field.state.value) : null}
                      onChange={(value) => value && field.handleChange(formatISO(value, { in: utc }))}
                      onBlur={field.handleBlur}
                      required
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
            <form.Field name="remarks">
              {(field) => (
                <label className="grid gap-1.5 text-sm">
                  <span className="font-heading">{t`Remarks`}</span>
                  <Textarea
                    aria-label={t`Remarks`}
                    value={field.state.value ?? ""}
                    onChange={(event) => field.handleChange(event.currentTarget.value)}
                    onBlur={field.handleBlur}
                    rows={2}
                  />
                </label>
              )}
            </form.Field>
            <div>
              <Button type="submit" disabled={isCreating || isUpdating} aria-busy={isCreating || isUpdating}>
                {booking ? <Trans>Save</Trans> : <Trans>Book</Trans>}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
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
        onClick={cancel}
        disabled={isPending}
        aria-busy={isPending}
        variant={"neutral"}
        size={"sm"}
      >
        {<TbTrash />}
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
      {isLoading && <Skeleton style={{ height: 96 }} />}
      {error && (
        <Alert variant={"destructive"}>
          <AlertTitle>{error.title}</AlertTitle>
          <AlertDescription>{error.detail}</AlertDescription>
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
              <Card key={booking.id} className="flex flex-col items-start gap-1">
                <CardContent>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-base font-bold">{booking.callsign}</span>
                    {event && (
                      <Badge>
                        <Trans>Event</Trans>
                      </Badge>
                    )}
                  </div>
                  <DateTime>{booking.start_at}</DateTime>
                  <DateTime>{booking.end_at}</DateTime>
                  {booking.remarks && <p className="text-sm text-gray-700 dark:text-gray-300">{booking.remarks}</p>}
                  {event && (
                    <Link to="/events/$id" params={{ id: event.id }}>
                      {eventTitle}
                    </Link>
                  )}
                  {!event && (
                    <div className="flex flex-wrap items-center gap-1">
                      <BookingModal booking={booking} />
                      <CancelBookingButton booking={booking} />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </section>
  );
};
