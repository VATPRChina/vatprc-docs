import { DateTime } from "@/components/event/datetime";
import { RequireRole } from "@/components/require-role";
import { DateTimeInput } from "@/components/ui/datetime-input";
import { ControllerInput } from "@/components/user-input";
import { components } from "@/lib/api";
import { $api, useUser } from "@/lib/client";
import { promiseWithLog } from "@/lib/utils";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Button, Card, Modal, Radio, Select, Skeleton, Table, Textarea, TextInput } from "@mantine/core";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/controllers/exams")({ component: ExamRecords });

type ExamRecord = components["schemas"]["ExamRecordDto"];
type Examiner = components["schemas"]["ExamExaminer"];
const ratings = ["S1", "S2", "S3", "C1", "C3", "I1", "I3", "SUP", "ADM"];

function ExamRecords() {
  const { t } = useLingui();
  const [creating, setCreating] = useState(false);
  const [selected, setSelected] = useState<ExamRecord>();
  const { data: records, error, isLoading } = $api.useQuery("get", "/api/atc/exams");
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-2xl font-medium">
          <Trans>Exam Records</Trans>
        </h2>
        <RequireRole role="controller-training-instructor">
          <Button onClick={() => setCreating(true)}>
            <Trans>Create Exam Record</Trans>
          </Button>
        </RequireRole>
      </div>
      {error && (
        <Alert color="red" title={error.title}>
          {error.detail}
        </Alert>
      )}
      {isLoading && <Skeleton h={160} />}
      {!isLoading && records?.length === 0 && (
        <Alert>
          <Trans>No exam records.</Trans>
        </Alert>
      )}
      <div className="flex flex-col gap-2">
        {records?.map((record) => (
          <Card key={record.id} withBorder>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">
                  {record.level} · {record.trainee.full_name} ({record.trainee.cid})
                </p>
                <p>
                  <DateTime>{record.start_at}</DateTime>
                </p>
                <p>{record.record_sheet_filing.find((answer) => answer.field.id === "result")?.answer}</p>
              </div>
              <Button variant="subtle" onClick={() => setSelected(record)}>
                <Trans>View</Trans>
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <Modal opened={creating} onClose={() => setCreating(false)} title={t`Create Exam Record`} size="xl">
        {creating && <ExamCreate onSaved={() => setCreating(false)} />}
      </Modal>
      <Modal opened={!!selected} onClose={() => setSelected(undefined)} title={t`Exam Record`} size="xl">
        {selected && <ExamDetail record={selected} />}
      </Modal>
    </section>
  );
}

function ExamCreate({ onSaved }: { onSaved: () => void }) {
  const { t, i18n } = useLingui();
  const user = useUser();
  const queryClient = useQueryClient();
  const [level, setLevel] = useState("S1");
  const [traineeId, setTraineeId] = useState("");
  const [startAt, setStartAt] = useState<string | null>(null);
  const [endAt, setEndAt] = useState<string | null>(null);
  const [answersByLevel, setAnswersByLevel] = useState<Record<string, Record<string, string>>>({});
  const [examiners, setExaminers] = useState<Examiner[]>([
    { name: user?.full_name ?? "", cid: user?.cid ?? "", rating: "" },
    { name: "", cid: "", rating: "" },
  ]);
  const {
    data: sheet,
    error: sheetError,
    isLoading,
  } = $api.useQuery("get", "/api/atc/exams/record-sheet/{level}", {
    params: { path: { level } },
  });
  const { mutateAsync, error, isPending } = $api.useMutation("post", "/api/atc/exams", {
    onSuccess: async () => {
      await queryClient.invalidateQueries($api.queryOptions("get", "/api/atc/exams"));
      onSaved();
    },
  });
  const answers = answersByLevel[level] ?? {};
  const setAnswer = (id: string, value: string) =>
    setAnswersByLevel((current) => ({
      ...current,
      [level]: { ...current[level], [id]: value },
    }));
  const updateExaminer = (index: number, key: keyof Examiner, value: string) =>
    setExaminers((current) => current.map((examiner, i) => (i === index ? { ...examiner, [key]: value } : examiner)));
  const complete =
    !!sheet?.fields.length &&
    sheet.fields.every((field) => field.kind === "long-text" || !!answers[field.id]?.trim()) &&
    !!traineeId &&
    !!startAt &&
    !!endAt &&
    new Date(endAt) > new Date(startAt) &&
    examiners.every((e) => e.name.trim() && /^\d+$/.test(e.cid) && e.rating);

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (!complete || !startAt || !endAt || !sheet) return;
        promiseWithLog(
          mutateAsync({
            body: {
              trainee_id: traineeId,
              level,
              start_at: new Date(startAt).toISOString(),
              end_at: new Date(endAt).toISOString(),
              examiners,
              request_answers: sheet.fields.map((field) => ({ id: field.id, answer: answers[field.id] ?? "" })),
            },
          }),
        );
      }}
    >
      {(error ?? sheetError) && (
        <Alert color="red" title={(error ?? sheetError)?.title}>
          {(error ?? sheetError)?.detail}
        </Alert>
      )}
      <ControllerInput label={t`Trainee`} required value={traineeId} onChange={(value) => setTraineeId(value ?? "")} />
      <Select
        label={t`Exam Level`}
        required
        data={["S1", "S2", "S3", "C1"]}
        value={level}
        onChange={(value) => value && setLevel(value)}
      />
      <DateTimeInput label={t`Start at`} value={startAt} onChange={setStartAt} required />
      <DateTimeInput label={t`End at`} value={endAt} onChange={setEndAt} required />
      <Alert>
        <Trans>Times are entered in UTC. The end time must be after the start time.</Trans>
      </Alert>
      <h3 className="text-xl">
        <Trans>Examiners</Trans>
      </h3>
      {examiners.map((examiner, index) => {
        const examinerNumber = index + 1;
        return (
          <Card key={index} withBorder className="flex flex-col gap-2">
            <p>
              <Trans>Examiner {examinerNumber}</Trans>
            </p>
            <TextInput
              label={t`Name`}
              required
              value={examiner.name}
              onChange={(event) => updateExaminer(index, "name", event.target.value)}
            />
            <TextInput
              label="CID"
              required
              inputMode="numeric"
              pattern="[0-9]+"
              value={examiner.cid}
              onChange={(event) => updateExaminer(index, "cid", event.target.value)}
            />
            <Select
              label={t`Rating`}
              required
              data={ratings}
              value={examiner.rating}
              onChange={(value) => updateExaminer(index, "rating", value ?? "")}
            />
            {index > 1 && (
              <Button variant="subtle" onClick={() => setExaminers((current) => current.filter((_, i) => i !== index))}>
                <Trans>Remove</Trans>
              </Button>
            )}
          </Card>
        );
      })}
      <Button
        variant="outline"
        disabled={examiners.length >= 20}
        onClick={() => setExaminers((current) => [...current, { name: "", cid: "", rating: "" }])}
      >
        <Trans>Add Examiner</Trans>
      </Button>
      <h3 className="text-xl">
        <Trans>Competency Assessment</Trans>
      </h3>
      <Alert>
        <Trans>N/A: Not applicable · I: Improvement needed · S: Satisfactory · G: Good</Trans>
      </Alert>
      {isLoading && <Skeleton h={200} />}
      {sheet?.fields.map((field) => {
        const label = i18n.locale === "zh-cn" || !field.name_en ? field.name_zh : field.name_en;
        const value = answers[field.id] ?? "";
        const category = /^(category-\d+)-\d+$/.exec(field.id)?.[1];
        if (category) {
          const criteria = sheet.fields.filter(
            (item) => item.id.startsWith(`${category}-`) && !item.id.endsWith("-remarks"),
          );
          if (criteria[0].id !== field.id) return null;
          return (
            <div key={category}>
              <h4 className="mb-2 font-medium">{field.name_zh.split(" — ")[0]}</h4>
              <Table.ScrollContainer minWidth={500}>
                <Table withTableBorder withColumnBorders>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>
                        <Trans>Requirement</Trans>
                      </Table.Th>
                      {["N/A", "I", "S", "G"].map((score) => (
                        <Table.Th key={score} w={48}>
                          {score}
                        </Table.Th>
                      ))}
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {criteria.map((criterion) => (
                      <Table.Tr key={criterion.id}>
                        <Table.Td>
                          {(i18n.locale === "zh-cn" || !criterion.name_en ? criterion.name_zh : criterion.name_en)
                            .split(" — ")
                            .slice(1)
                            .join(" — ") || criterion.name_zh}
                        </Table.Td>
                        {["N/A", "I", "S", "G"].map((score) => (
                          <Table.Td key={score}>
                            <Radio
                              name={criterion.id}
                              value={score}
                              aria-label={`${criterion.name_zh}: ${score}`}
                              checked={answers[criterion.id] === score}
                              onChange={() => setAnswer(criterion.id, score)}
                              required
                            />
                          </Table.Td>
                        ))}
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </div>
          );
        }
        if (field.kind === "single-choice")
          return (
            <Select
              key={field.id}
              label={label}
              required
              data={field.single_choice_options}
              value={value}
              onChange={(v) => setAnswer(field.id, v ?? "")}
            />
          );
        if (field.kind === "long-text")
          return (
            <Textarea
              key={field.id}
              label={label}
              autosize
              minRows={3}
              value={value}
              onChange={(event) => setAnswer(field.id, event.target.value)}
            />
          );
        return (
          <TextInput
            key={field.id}
            label={label}
            required
            value={value}
            onChange={(event) => setAnswer(field.id, event.target.value)}
          />
        );
      })}
      <Button type="submit" disabled={!complete} loading={isPending}>
        <Trans>Save Exam Record</Trans>
      </Button>
    </form>
  );
}

function ExamDetail({ record }: { record: ExamRecord }) {
  const { i18n } = useLingui();
  return (
    <div className="flex flex-col gap-4">
      <p>
        {record.level} · {record.trainee.full_name} ({record.trainee.cid})
      </p>
      <p>
        <DateTime>{record.start_at}</DateTime> – <DateTime>{record.end_at}</DateTime>
      </p>
      <p>
        <Trans>Recorded by</Trans>: {record.instructor.full_name} ({record.instructor.cid})
      </p>
      <h3 className="text-xl">
        <Trans>Examiners</Trans>
      </h3>
      {record.examiners.map((examiner) => (
        <p key={examiner.cid}>
          {examiner.name} ({examiner.cid}) · {examiner.rating}
        </p>
      ))}
      <Table>
        <Table.Tbody>
          {record.record_sheet_filing.map(({ field, answer }) => (
            <Table.Tr key={field.id}>
              <Table.Th>{i18n.locale === "zh-cn" || !field.name_en ? field.name_zh : field.name_en}</Table.Th>
              <Table.Td className="whitespace-pre-wrap">{answer || "—"}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
