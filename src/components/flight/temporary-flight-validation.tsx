import { FlightDetails } from "./flight-details";
import { FlightRouteView } from "./flight-route";
import { AlertDescription, Alert, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import type { operations } from "@/lib/api";
import { usePermissions } from "@/lib/client";
import { client } from "@/lib/client/client";
import { Trans, useLingui } from "@lingui/react/macro";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

type TemporaryPlan = operations["temporary_flight_validation"]["parameters"]["query"];

export function TemporaryFlightValidation() {
  const roles = usePermissions();
  if (!roles.includes("software-engineer")) {
    return (
      <Alert variant={"destructive"}>
        <AlertDescription>
          <Trans>Software engineer access required.</Trans>
        </AlertDescription>
      </Alert>
    );
  }
  return <TemporaryFlightValidationForm />;
}

function TemporaryFlightValidationForm() {
  const { t } = useLingui();
  const [plan, setPlan] = useState<Required<TemporaryPlan>>({
    departure: "",
    arrival: "",
    aircraft: "",
    flight_rules: "I",
    wake_category: "M",
    equipment: "",
    navigation_performance: "",
    transponder: "",
    raw_route: "",
    cruising_level: 0,
  });
  const validation = useMutation({
    mutationFn: async (submittedPlan: TemporaryPlan) => {
      const params = { params: { query: submittedPlan } };
      const [flight, validation, route] = await Promise.all([
        client.GET("/api/flights/temporary/by-plan", params),
        client.GET("/api/flights/temporary/by-plan/validation", params),
        client.GET("/api/flights/temporary/by-plan/route", params),
      ]);
      if (flight.error || !flight.data)
        throw new Error(flight.error?.detail ?? flight.error?.title ?? flight.response.statusText);
      if (validation.error || !validation.data)
        throw new Error(validation.error?.detail ?? validation.error?.title ?? validation.response.statusText);
      return { plan: flight.data.flight_plan, validation: validation.data, route: route.data, routeError: route.error };
    },
    retry: false,
  });
  const textField = (name: Exclude<keyof TemporaryPlan, "cruising_level" | "flight_rules" | "wake_category">) => ({
    value: plan[name],
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = event.currentTarget.value.toUpperCase();
      setPlan((previous) => ({ ...previous, [name]: value }));
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl">
        <Trans>Temporary Flight Plan</Trans>
      </h1>
      <p>
        <Trans>Enter a flight plan to run validation without filing it on VATSIM.</Trans>
      </p>
      <Card>
        <CardContent>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              if (validation.isPending) return;
              const submitted = { ...plan };
              for (const key of Object.keys(submitted) as (keyof typeof submitted)[]) {
                if (key !== "cruising_level") submitted[key] = submitted[key].trim().toUpperCase();
              }
              validation.mutate(submitted);
            }}
            className="flex flex-col gap-4"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="grid gap-1.5 text-sm">
                <span className="font-heading">{t`Departure`}</span>
                <Input
                  aria-label={t`Departure`}
                  placeholder="ZBAA"
                  required
                  pattern="[A-Za-z]{4}"
                  maxLength={4}
                  {...textField("departure")}
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-heading">{t`Arrival`}</span>
                <Input
                  aria-label={t`Arrival`}
                  placeholder="VHHH"
                  required
                  pattern="[A-Za-z]{4}"
                  maxLength={4}
                  {...textField("arrival")}
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-heading">{t`Aircraft Type`}</span>
                <Input aria-label={t`Aircraft Type`} placeholder="B738" required {...textField("aircraft")} />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-heading">{t`Flight Rules`}</span>
                <NativeSelect
                  aria-label={t`Flight Rules`}
                  value={plan.flight_rules ?? ""}
                  onChange={(event) => {
                    const value = event.currentTarget.value || null;
                    return setPlan((previous) => ({ ...previous, flight_rules: value ?? "I" }));
                  }}
                >
                  <NativeSelectOption value=""></NativeSelectOption>
                  {[
                    { value: "I", label: "IFR" },
                    { value: "V", label: "VFR" },
                  ].map((option) => {
                    const item = typeof option === "string" ? { value: option, label: option } : option;
                    return (
                      <NativeSelectOption key={item.value} value={item.value}>
                        {item.label}
                      </NativeSelectOption>
                    );
                  })}
                </NativeSelect>
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-heading">{t`Wake Category`}</span>
                <NativeSelect
                  aria-label={t`Wake Category`}
                  value={plan.wake_category ?? ""}
                  onChange={(event) => {
                    const value = event.currentTarget.value || null;
                    return setPlan((previous) => ({ ...previous, wake_category: value ?? "M" }));
                  }}
                >
                  <NativeSelectOption value=""></NativeSelectOption>
                  {["L", "M", "H", "J"].map((option) => {
                    const item = typeof option === "string" ? { value: option, label: option } : option;
                    return (
                      <NativeSelectOption key={item.value} value={item.value}>
                        {item.label}
                      </NativeSelectOption>
                    );
                  })}
                </NativeSelect>
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-heading">{t`Cruising Level (feet)`}</span>
                <Input
                  aria-label={t`Cruising Level (feet)`}
                  required
                  min={0}
                  step={100}
                  value={plan.cruising_level}
                  type={"number"}
                  onChange={(event) => {
                    const value = event.currentTarget.valueAsNumber;
                    return setPlan((previous) => ({
                      ...previous,
                      cruising_level: typeof value === "number" ? value : 0,
                    }));
                  }}
                />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-heading">{t`Equipment`}</span>
                <Input aria-label={t`Equipment`} placeholder="SDE2E3FGHIRWXY" {...textField("equipment")} />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-heading">{t`Transponder`}</span>
                <Input aria-label={t`Transponder`} placeholder="LB1" {...textField("transponder")} />
              </label>
              <label className="grid gap-1.5 text-sm">
                <span className="font-heading">{t`PBN`}</span>
                <Input aria-label={t`PBN`} placeholder="A1B1C1D1O1S1" {...textField("navigation_performance")} />
              </label>
            </div>
            <label className="grid gap-1.5 text-sm">
              <span className="font-heading">{t`Route`}</span>
              <Textarea aria-label={t`Route`} {...textField("raw_route")} rows={3} />
            </label>
            <Button
              type="submit"
              className="self-start"
              disabled={validation.isPending}
              aria-busy={validation.isPending}
            >
              <Trans>Run Validation</Trans>
            </Button>
          </form>
        </CardContent>
      </Card>
      {validation.isError && (
        <Alert role="alert" variant={"destructive"}>
          <AlertTitle>{t`Validation failed`}</AlertTitle>
          <AlertDescription>{validation.error.message}</AlertDescription>
        </Alert>
      )}
      {validation.data && (
        <section aria-label={t`Validation Result`} className="flex flex-col gap-3">
          <p className="text-sm">
            <Trans>Last validated flight plan</Trans>
          </p>
          <FlightDetails plan={validation.data.plan} validation={validation.data.validation} temporary>
            <FlightRouteView data={validation.data.route} error={validation.data.routeError} />
          </FlightDetails>
        </section>
      )}
    </div>
  );
}
