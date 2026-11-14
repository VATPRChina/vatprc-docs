import { DateTimeInput } from "./ui/datetime-input";
import { AlertTitle, AlertDescription, Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { components } from "@/lib/api";
import { $api, useUser } from "@/lib/client";
import { promiseWithLog } from "@/lib/helpers";
import { utc } from "@date-fns/utc";
import { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { useForm } from "@tanstack/react-form";
import { formatISO } from "date-fns";
import { useState as useDisclosureState } from "react";
import { FC } from "react";
import { TbEdit } from "react-icons/tb";

export const CRUISE_LEVELS = {
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
  const [opened, setOpened] = useDisclosureState(false);
  const toggle = () => setOpened((value) => !value);
  const close = () => setOpened(false);

  const user = useUser();
  const {
    data,
    error: loadError,
    isLoading,
  } = $api.useQuery(
    "get",
    "/api/navdata/preferred-routes/{id}",
    { params: { path: { id: id ?? "" } } },
    { enabled: !!id && opened },
  );
  const title = data?.departure && data?.arrival ? `${data.departure} - ${data.arrival}` : null;

  const {
    mutate: create,
    isPending: isCreatePending,
    error: createError,
  } = $api.useMutation("post", "/api/navdata/preferred-routes", { onSuccess: () => close() });
  const {
    mutate: update,
    isPending: isUpdatePending,
    error: updateError,
  } = $api.useMutation("put", "/api/navdata/preferred-routes/{id}", { onSuccess: () => close() });
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
        <Button aria-label={t`Edit Preferred Route {title}`} onClick={toggle} size={"icon-sm"} variant={"neutral"}>
          <TbEdit size={18} />
        </Button>
      ) : (
        <Button onClick={toggle}>
          <Trans>Create Preferred Route</Trans>
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
            <DialogTitle>{id ? t`Edit Preferred Route ${title}` : t`Create Preferred Route`}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              promiseWithLog(form.handleSubmit());
            }}
          >
            <div className="flex flex-col gap-4">
              {(loadError ?? createError ?? updateError) && (
                <Alert variant={"destructive"}>
                  <AlertTitle>{(loadError ?? createError ?? updateError)?.title}</AlertTitle>
                  <AlertDescription>{(loadError ?? createError ?? updateError)?.detail}</AlertDescription>
                </Alert>
              )}
              <div className="grid grid-cols-2 gap-2">
                <form.Field name="departure">
                  {(field) => (
                    <label className="grid gap-1.5 text-sm">
                      <span className="font-heading">{t`Departure`}</span>
                      <Input
                        aria-label={t`Departure`}
                        onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        disabled={isLoading}
                      />
                    </label>
                  )}
                </form.Field>
                <form.Field name="arrival">
                  {(field) => (
                    <label className="grid gap-1.5 text-sm">
                      <span className="font-heading">{t`Arrival`}</span>
                      <Input
                        aria-label={t`Arrival`}
                        onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        disabled={isLoading}
                      />
                    </label>
                  )}
                </form.Field>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <form.Field name="valid_from">
                  {(field) => (
                    <label className="grid gap-1.5 text-sm">
                      <span className="font-heading">{t`Valid From`}</span>
                      <DateTimeInput
                        aria-label={t`Valid From`}
                        onChange={(e) => field.handleChange(e && formatISO(e, { in: utc }))}
                        value={field.state.value && new Date(field.state.value)}
                        onBlur={field.handleBlur}
                        disabled={isLoading}
                      />
                    </label>
                  )}
                </form.Field>
                <form.Field name="valid_until">
                  {(field) => (
                    <label className="grid gap-1.5 text-sm">
                      <span className="font-heading">{t`Valid Until`}</span>
                      <DateTimeInput
                        aria-label={t`Valid Until`}
                        onChange={(e) => field.handleChange(e && formatISO(e, { in: utc }))}
                        value={field.state.value && new Date(field.state.value)}
                        onBlur={field.handleBlur}
                        disabled={isLoading}
                      />
                    </label>
                  )}
                </form.Field>
              </div>
              <form.Field name="raw_route">
                {(field) => (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-heading">{t`Route`}</span>
                    <Textarea
                      aria-label={t`Route`}
                      onChange={(e) => field.handleChange(e.target.value.toUpperCase())}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      disabled={isLoading}
                      rows={5}
                    />
                  </label>
                )}
              </form.Field>
              <form.Field name="cruising_level_restriction">
                {(field) => (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-heading">{t`Cruising Level Type`}</span>
                    <NativeSelect
                      aria-label={t`Cruising Level Type`}
                      onBlur={field.handleBlur}
                      disabled={isLoading}
                      value={field.state.value ?? ""}
                      onChange={(event) => {
                        const value = event.currentTarget.value || null;
                        return value && field.handleChange(value as components["schemas"]["LevelRestrictionType"]);
                      }}
                    >
                      <NativeSelectOption value="">{"Pick value"}</NativeSelectOption>
                      {(Object.entries(CRUISE_LEVELS).map(([value, msg]) => ({ value, label: i18n._(msg) })) ?? []).map(
                        (option) => {
                          const item = typeof option === "string" ? { value: option, label: option } : option;
                          return (
                            <NativeSelectOption key={item.value} value={item.value}>
                              {item.label}
                            </NativeSelectOption>
                          );
                        },
                      )}
                    </NativeSelect>
                  </label>
                )}
              </form.Field>
              <form.Field name="remarks">
                {(field) => (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-heading">{t`Description`}</span>
                    <Textarea
                      aria-label={t`Description`}
                      onChange={(e) => field.handleChange(e.target.value)}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      disabled={true}
                      rows={5}
                    />
                  </label>
                )}
              </form.Field>
              <div className="flex flex-wrap items-center gap-1">
                <Button
                  type="submit"
                  disabled={isCreatePending || isUpdatePending}
                  aria-busy={isCreatePending || isUpdatePending}
                  variant={"neutral"}
                >
                  {id ? t`Save` : t`Create`}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
