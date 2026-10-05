import { ParsedRoute } from "@/components/flight-parsed-route";
import { RequireRole } from "@/components/require-role";
import { Trans, useLingui } from "@lingui/react/macro";
import { Button, Textarea } from "@mantine/core";
import { useState } from "react";

export const RouteViewer = () => (
  <RequireRole role="software-engineer">
    <RouteViewerForm />
  </RequireRole>
);

function RouteViewerForm() {
  const { t } = useLingui();
  const [input, setInput] = useState("");
  const [route, setRoute] = useState("");
  const normalized = input.trim().replace(/\s+/g, " ").toUpperCase();
  const canSubmit = Boolean(normalized) && normalized !== route;

  return (
    <div className="flex w-full flex-col gap-4">
      <h1 className="text-3xl">
        <Trans>Route Viewer</Trans>
      </h1>
      <form
        className="flex flex-col items-start gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          if (canSubmit) setRoute(normalized);
        }}
      >
        <Textarea
          className="w-full"
          label={t`Complete route`}
          description={t`Include the departure and arrival airports, for example: ZBAA DCT ZSPD.`}
          placeholder="ZBAA DCT ZSPD"
          value={input}
          onChange={(event) => setInput(event.currentTarget.value.toUpperCase())}
          autosize
          minRows={3}
          maxRows={10}
          spellCheck={false}
          autoCapitalize="characters"
        />
        <Button type="submit" disabled={!canSubmit}>
          <Trans>Parse route</Trans>
        </Button>
      </form>
      {route && <ParsedRoute key={route} route={route} />}
    </div>
  );
}
