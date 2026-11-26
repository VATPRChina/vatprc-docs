import { airspaceClient, Application } from "@/lib/airspace-applications";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Badge, Button, Card, Group, Loader, Stack, Text, Textarea } from "@mantine/core";
import { useCallback, useEffect, useState } from "react";

export function AirspaceReview() {
  const { t } = useLingui();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [comments, setComments] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const result = await airspaceClient.GET("/api/airspace-applications");
      if (result.error || !result.data) setError(result.error?.detail ?? t`Unable to load applications.`);
      else {
        setApplications(result.data);
        setError("");
      }
    } catch {
      setError(t`Unable to load applications.`);
    } finally {
      setLoading(false);
    }
  }, [t]);
  useEffect(() => {
    void load();
  }, [load]);

  async function decide(application: Application, status: "approved" | "rejected") {
    setBusy(application.id);
    setError("");
    try {
      const result = await airspaceClient.PUT("/api/airspace-applications/{id}/review", {
        params: { path: { id: application.id } },
        body: { status, comment: comments[application.id]?.trim() || null },
      });
      if (result.error || !result.data) setError(result.error?.detail ?? t`Unable to review the application.`);
      else await load();
    } catch {
      setError(t`Unable to review the application.`);
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-4">
      <h1 className="text-3xl">
        <Trans>Airspace Review</Trans>
      </h1>
      {error && <Alert color="red">{error}</Alert>}
      {loading && <Loader />}
      {!loading && applications.length === 0 && (
        <Text>
          <Trans>No airspace applications.</Trans>
        </Text>
      )}
      {applications.map((application) => (
        <Card key={application.id} withBorder>
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={600}>{application.label}</Text>
              <Badge>
                {application.status === "submitted"
                  ? t`Submitted`
                  : application.status === "approved"
                    ? t`Approved`
                    : t`Rejected`}
              </Badge>
            </Group>
            <Text>
              {application.applicant_name} ({application.applicant_cid})
            </Text>
            <Text>
              {application.starts_at} — {application.ends_at} (UTC)
            </Text>
            <Text>
              {application.category === "Restricted"
                ? t`Restricted area`
                : application.category === "Danger"
                  ? t`Danger area`
                  : t`Prohibited area`}{" "}
              · {application.lower_ft}–{application.upper_ft} ft
            </Text>
            <Text style={{ whiteSpace: "pre-wrap" }}>
              {application.boundary.type === "circle"
                ? `${application.boundary.center.latitude}, ${application.boundary.center.longitude} / ${application.boundary.radius_km} km`
                : application.boundary.vertices.map((p) => `${p.latitude}, ${p.longitude}`).join("\n")}
            </Text>
            {application.remarks && (
              <Text>
                <Trans>Remarks</Trans>: {application.remarks}
              </Text>
            )}
            {application.status === "submitted" ? (
              <>
                <Textarea
                  label={t`Review comment (optional)`}
                  value={comments[application.id] ?? ""}
                  onChange={(event) => setComments({ ...comments, [application.id]: event.currentTarget.value })}
                />
                <Group>
                  <Button
                    loading={busy === application.id}
                    disabled={!!busy}
                    onClick={() => {
                      void decide(application, "approved");
                    }}
                  >
                    <Trans>Approve</Trans>
                  </Button>
                  <Button
                    color="red"
                    loading={busy === application.id}
                    disabled={!!busy}
                    onClick={() => {
                      void decide(application, "rejected");
                    }}
                  >
                    <Trans>Reject</Trans>
                  </Button>
                </Group>
              </>
            ) : (
              application.review_comment && (
                <Text>
                  <Trans>Review comment</Trans>: {application.review_comment}
                </Text>
              )
            )}
          </Stack>
        </Card>
      ))}
    </div>
  );
}
