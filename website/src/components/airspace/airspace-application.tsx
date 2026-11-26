import { airspaceClient, Boundary, parseCoordinate } from "@/lib/airspace-applications";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Button, NumberInput, Paper, Radio, Select, Stack, Textarea, TextInput } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { useState } from "react";

export function AirspaceApplication() {
  const { t } = useLingui();
  const [shape, setShape] = useState("circle");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [lower, setLower] = useState<string | number>("");
  const [upper, setUpper] = useState<string | number>("");
  const [label, setLabel] = useState("");
  const [remarks, setRemarks] = useState("");
  const [center, setCenter] = useState("");
  const [radius, setRadius] = useState<string | number>("");
  const [vertices, setVertices] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function submit() {
    setError("");
    const startDate = Date.parse(`${start}Z`);
    const endDate = Date.parse(`${end}Z`);
    if (!Number.isFinite(startDate) || !Number.isFinite(endDate) || endDate <= startDate) {
      setError(t`Enter a valid time range with the end after the start.`);
      return;
    }
    if (
      !category ||
      !label.trim() ||
      lower === "" ||
      upper === "" ||
      !Number.isInteger(Number(lower)) ||
      !Number.isInteger(Number(upper)) ||
      Number(lower) < 0 ||
      Number(upper) < Number(lower)
    ) {
      setError(t`Enter the airspace type, label and a valid altitude range.`);
      return;
    }
    let boundary: Boundary;
    if (shape === "circle") {
      const point = parseCoordinate(center);
      if (
        !point ||
        radius === "" ||
        !Number.isFinite(Number(radius)) ||
        Number(radius) <= 0 ||
        Number(radius) > 20000
      ) {
        setError(t`Enter valid center coordinates and a positive radius.`);
        return;
      }
      boundary = { type: "circle", center: point, radius_km: Number(radius) };
    } else {
      const points = vertices.trim().split(/\r?\n/).map(parseCoordinate);
      if (points.length < 4 || points.some((point) => point === null)) {
        setError(t`Enter at least three valid vertices and repeat the first coordinate at the end.`);
        return;
      }
      const coordinates = points.filter((point) => point !== null);
      const first = coordinates[0];
      const last = coordinates[coordinates.length - 1];
      if (first.latitude !== last.latitude || first.longitude !== last.longitude) {
        setError(t`The first and last boundary coordinates must match.`);
        return;
      }
      boundary = { type: "polygon", vertices: coordinates };
    }
    setPending(true);
    try {
      const result = await airspaceClient.POST("/api/airspace-applications", {
        body: {
          starts_at: new Date(startDate).toISOString(),
          ends_at: new Date(endDate).toISOString(),
          category,
          lower_ft: Number(lower),
          upper_ft: Number(upper),
          label: label.trim(),
          remarks: remarks.trim() || null,
          boundary,
        },
      });
      if (result.error || !result.data) {
        setError(result.error?.detail ?? t`Unable to submit the application.`);
        return;
      }
      setSubmitted(true);
    } catch {
      setError(t`Unable to submit the application.`);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="container mx-auto flex max-w-3xl flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">
          <Trans>Airspace Application</Trans>
        </h1>
        <Link
          to="/airspace/restricted"
          search={{ apply: undefined, review: undefined }}
          className="text-blue-600 underline"
        >
          <Trans>Back</Trans>
        </Link>
      </div>
      {error && <Alert color="red">{error}</Alert>}
      {submitted && (
        <Alert color="green">
          <Trans>Your airspace application has been submitted for review.</Trans>
        </Alert>
      )}
      <Paper withBorder p="md">
        <Stack>
          <TextInput
            type="datetime-local"
            label={t`Start time (UTC)`}
            value={start}
            onChange={(e) => setStart(e.currentTarget.value)}
            required
          />
          <TextInput
            type="datetime-local"
            label={t`End time (UTC)`}
            value={end}
            onChange={(e) => setEnd(e.currentTarget.value)}
            required
          />
          <Select
            label={t`Airspace type`}
            value={category}
            onChange={setCategory}
            data={[
              { value: "Restricted", label: t`Restricted area` },
              { value: "Danger", label: t`Danger area` },
              { value: "Prohibit", label: t`Prohibited area` },
            ]}
            required
          />
          <NumberInput label={t`Lower altitude (ft)`} value={lower} onChange={setLower} allowDecimal={false} required />
          <NumberInput label={t`Upper altitude (ft)`} value={upper} onChange={setUpper} allowDecimal={false} required />
          <TextInput
            label={t`Label`}
            value={label}
            onChange={(e) => setLabel(e.currentTarget.value)}
            required
            maxLength={200}
          />
          <Textarea
            label={t`Remarks (optional)`}
            value={remarks}
            onChange={(e) => setRemarks(e.currentTarget.value)}
            autosize
            minRows={2}
          />
          <Radio.Group label={t`Boundary type`} value={shape} onChange={setShape}>
            <div className="mt-2 flex gap-4">
              <Radio value="circle" label={t`Circle`} />
              <Radio value="polygon" label={t`Coordinates`} />
            </div>
          </Radio.Group>
          {shape === "circle" ? (
            <>
              <TextInput
                label={t`Center coordinates`}
                description={t`WGS-84 decimal degrees, latitude, longitude`}
                placeholder="21.1234545, 115.1234545"
                value={center}
                onChange={(e) => setCenter(e.currentTarget.value)}
                required
              />
              <NumberInput label={t`Radius (km)`} value={radius} onChange={setRadius} min={0} required />
            </>
          ) : (
            <Textarea
              label={t`Boundary coordinates`}
              description={t`WGS-84 decimal degrees, latitude, longitude; one coordinate per line, in boundary order. Close the polygon by repeating the first coordinate.`}
              placeholder={
                "21.1234545, 115.1234545\n21.2234545, 115.1234545\n21.2234545, 115.2234545\n21.1234545, 115.1234545"
              }
              value={vertices}
              onChange={(e) => setVertices(e.currentTarget.value)}
              autosize
              minRows={5}
              required
            />
          )}
          <Button
            onClick={() => {
              void submit();
            }}
            loading={pending}
            disabled={submitted}
          >
            <Trans>Submit application</Trans>
          </Button>
        </Stack>
      </Paper>
    </div>
  );
}
