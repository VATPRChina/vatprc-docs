import { ValidationChecks, FlightValidationContext } from "./validation";
import type { operations } from "@/lib/api";
import { usePermissions } from "@/lib/client";
import { client } from "@/lib/client/client";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Button, NumberInput, Paper, Select, Textarea, TextInput } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

type TemporaryPlan = operations["temporary_flight_validation"]["parameters"]["query"];

export function TemporaryFlightValidation() {
  const roles = usePermissions();
  if (!roles.includes("software-engineer")) {
    return (
      <Alert color="red">
        <Trans>Software engineer access required.</Trans>
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
      const { data, error, response } = await client.GET("/api/flights/temporary/by-plan/validation", {
        params: { query: submittedPlan },
      });
      if (error || !data) throw new Error(error?.detail ?? error?.title ?? response.statusText);
      return { plan: submittedPlan, validation: data };
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
      <Paper withBorder p="md">
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
            <TextInput
              label={t`Departure`}
              placeholder="ZBAA"
              required
              pattern="[A-Za-z]{4}"
              maxLength={4}
              {...textField("departure")}
            />
            <TextInput
              label={t`Arrival`}
              placeholder="VHHH"
              required
              pattern="[A-Za-z]{4}"
              maxLength={4}
              {...textField("arrival")}
            />
            <TextInput label={t`Aircraft Type`} placeholder="B738" required {...textField("aircraft")} />
            <Select
              label={t`Flight Rules`}
              data={[
                { value: "I", label: "IFR" },
                { value: "V", label: "VFR" },
              ]}
              value={plan.flight_rules}
              allowDeselect={false}
              onChange={(value) => setPlan((previous) => ({ ...previous, flight_rules: value ?? "I" }))}
            />
            <Select
              label={t`Wake Category`}
              data={["L", "M", "H", "J"]}
              value={plan.wake_category}
              allowDeselect={false}
              onChange={(value) => setPlan((previous) => ({ ...previous, wake_category: value ?? "M" }))}
            />
            <NumberInput
              label={t`Cruising Level (feet)`}
              required
              min={0}
              step={100}
              allowDecimal={false}
              allowNegative={false}
              value={plan.cruising_level}
              onChange={(value) =>
                setPlan((previous) => ({ ...previous, cruising_level: typeof value === "number" ? value : 0 }))
              }
            />
            <TextInput label={t`Equipment`} placeholder="SDE2E3FGHIRWXY" {...textField("equipment")} />
            <TextInput label={t`Transponder`} placeholder="LB1" {...textField("transponder")} />
            <TextInput label={t`PBN`} placeholder="A1B1C1D1O1S1" {...textField("navigation_performance")} />
          </div>
          <Textarea label={t`Route`} autosize minRows={3} {...textField("raw_route")} />
          <Button type="submit" loading={validation.isPending} className="self-start">
            <Trans>Run Validation</Trans>
          </Button>
        </form>
      </Paper>
      {validation.isError && (
        <Alert color="red" title={t`Validation failed`} role="alert">
          {validation.error.message}
        </Alert>
      )}
      {validation.data && (
        <section aria-label={t`Validation Result`} className="flex flex-col gap-3">
          <h2 className="text-2xl">
            <Trans>Validation Result</Trans>
          </h2>
          <Paper withBorder p="sm" className="flex flex-col gap-1">
            <h3 className="font-semibold">
              <Trans>Last validated flight plan</Trans>
            </h3>
            <p>
              {validation.data.plan.departure} → {validation.data.plan.arrival} · {validation.data.plan.aircraft} ·{" "}
              {validation.data.plan.cruising_level} ft
            </p>
            <p>
              <Trans>Flight Rules</Trans>: {validation.data.plan.flight_rules} · <Trans>Wake Category</Trans>:{" "}
              {validation.data.plan.wake_category}
            </p>
            <p>
              <Trans>Equipment</Trans>: {validation.data.plan.equipment || "—"} · <Trans>Transponder</Trans>:{" "}
              {validation.data.plan.transponder || "—"} · <Trans>PBN</Trans>:{" "}
              {validation.data.plan.navigation_performance || "—"}
            </p>
            <p className="font-mono wrap-break-word">{validation.data.plan.raw_route || "DCT"}</p>
          </Paper>
          <FlightValidationContext.Provider value={validation.data.validation}>
            <ValidationChecks />
          </FlightValidationContext.Provider>
        </section>
      )}
    </div>
  );
}
