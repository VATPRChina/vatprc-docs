import { expect, test as baseTest } from "vitest";
import { getClient } from "../../../lib/backend.js";
import type { components } from "../../../lib/api/schema.js";

const test = baseTest
  .extend("instructor", async () =>
    getClient(["controller-training-instructor"]),
  )
  .extend("trainee", async () => getClient(["controller"]))
  .extend("request", async ({ instructor, trainee }) => {
    const session = await trainee.GET("/api/session");
    const sheet = await instructor.GET("/api/atc/exams/record-sheet/{level}", {
      params: { path: { level: "S1" } },
    });
    expect(sheet.response.status).toBe(200);
    return {
      trainee_id: session.data!.user!.id,
      level: "S1",
      start_at: "2026-11-01T10:00:00Z",
      end_at: "2026-11-01T11:00:00Z",
      examiners: [
        { name: "Examiner One", cid: "1234567", rating: "I1" },
        { name: "Examiner Two", cid: "1234568", rating: "C1" },
      ],
      request_answers: sheet.data!.fields.map((field) => ({
        id: field.id,
        answer:
          field.kind === "single-choice"
            ? field.single_choice_options[0]
            : field.kind === "long-text"
              ? ""
              : "ZBAA_GND",
      })),
    } satisfies components["schemas"]["ExamRecordCreateRequest"];
  });

test("creates a sheet filing and limits exam visibility", async ({
  instructor,
  trainee,
  request,
}) => {
  const created = await instructor.POST("/api/atc/exams", { body: request });
  expect(created.response.status).toBe(200);
  expect(created.data!.record_sheet_filing).toHaveLength(
    request.request_answers.length,
  );
  expect(created.data!.examiners).toEqual(request.examiners);
  expect(created.data!.trainee.id).toBe(request.trainee_id);
  const params = { path: { id: created.data!.id } };
  const assistant = await getClient(["controller-training-director-assistant"]);
  for (const viewer of [instructor, trainee, assistant]) {
    expect(
      (await viewer.GET("/api/atc/exams/{id}", { params })).response.status,
    ).toBe(200);
    expect(
      (await viewer.GET("/api/atc/exams")).data!.map((record) => record.id),
    ).toContain(created.data!.id);
  }
  const stranger = await getClient([]);
  expect(
    (await stranger.GET("/api/atc/exams/{id}", { params })).response.status,
  ).toBe(404);
  expect((await stranger.GET("/api/atc/exams")).data).toEqual([]);
});

test("only instructors create exam records", async ({ trainee, request }) => {
  const mentor = await getClient(["controller-training-mentor"]);
  const anonymous = await getClient();
  for (const viewer of [trainee, mentor]) {
    expect(
      (await viewer.POST("/api/atc/exams", { body: request })).response.status,
    ).toBe(403);
  }
  expect(
    (await anonymous.POST("/api/atc/exams", { body: request })).response.status,
  ).toBe(401);
});

test("rejects invalid scores, duplicate answers and invalid times without creating records", async ({
  instructor,
  request,
}) => {
  const before = (await instructor.GET("/api/atc/exams")).data!.length;
  const score = request.request_answers.findIndex(
    (answer) => answer.id === "category-1-1",
  );
  const invalidScore = structuredClone(request);
  invalidScore.request_answers[score].answer = "INVALID";
  const duplicate = structuredClone(request);
  duplicate.request_answers.push(duplicate.request_answers[0]);
  for (const body of [
    invalidScore,
    duplicate,
    { ...request, end_at: request.start_at },
  ]) {
    expect(
      (await instructor.POST("/api/atc/exams", { body })).response.status,
    ).toBe(400);
  }
  expect((await instructor.GET("/api/atc/exams")).data).toHaveLength(before);
});

test("every CPT level exposes its own assessment criteria", async ({
  instructor,
}) => {
  for (const level of ["S1", "S2", "S3", "C1"]) {
    const sheet = await instructor.GET("/api/atc/exams/record-sheet/{level}", {
      params: { path: { level } },
    });
    expect(sheet.response.status).toBe(200);
    expect(sheet.data!.id).toBe(`exam-record-${level.toLowerCase()}`);
    expect(
      sheet.data!.fields.filter((field) => /^category-\d+-\d+$/.test(field.id))
        .length,
    ).toBeGreaterThan(30);
  }
});
