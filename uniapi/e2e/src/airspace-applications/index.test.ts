import { expect, test as baseTest } from "vitest";
import { getClient } from "../../lib/backend.js";

type Boundary =
  | {
      type: "circle";
      center: { latitude: number; longitude: number };
      radius_km: number;
    }
  | { type: "polygon"; vertices: { latitude: number; longitude: number }[] };

type Request = {
  starts_at: string;
  ends_at: string;
  category: string;
  lower_ft: number;
  upper_ft: number;
  label: string;
  remarks: string | null;
  boundary: Boundary;
};

type Application = Request & {
  id: string;
  applicant_cid: string;
  status: string;
  reviewer_id: string | null;
  reviewed_at: string | null;
  review_comment: string | null;
};

type Result<T> = { data?: T; error?: unknown; response: Response };
type AirspaceClient = {
  GET(path: "/api/airspace-applications"): Promise<Result<Application[]>>;
  POST(
    path: "/api/airspace-applications",
    options: { body: Request },
  ): Promise<Result<Application>>;
  PUT(
    path: "/api/airspace-applications/{id}/review",
    options: {
      params: { path: { id: string } };
      body: { status: string; comment: string | null };
    },
  ): Promise<Result<Application>>;
};

const createRequest = (): Request => ({
  starts_at: "2031-10-20T10:00:00Z",
  ends_at: "2031-10-20T13:00:00Z",
  category: "Restricted",
  lower_ft: 0,
  upper_ft: 10000,
  label: `E2E airspace ${crypto.randomUUID()}`,
  remarks: "E2E test",
  boundary: {
    type: "circle",
    center: { latitude: 21.1234545, longitude: 115.1234545 },
    radius_km: 20,
  },
});

const test = baseTest
  .extend(
    "applicant",
    async () =>
      (await getClient(["airspace-applicant"])) as unknown as AirspaceClient,
  )
  .extend(
    "reviewer",
    async () =>
      (await getClient(["operation-director"])) as unknown as AirspaceClient,
  )
  .extend(
    "ordinaryUser",
    async () => (await getClient([])) as unknown as AirspaceClient,
  )
  .extend(
    "anonymous",
    async () => (await getClient()) as unknown as AirspaceClient,
  )
  .extend("application", async ({ applicant }) => {
    const result = await applicant.POST("/api/airspace-applications", {
      body: createRequest(),
    });
    expect(result.response.status).toBe(200);
    expect(result.data).toBeDefined();
    return result.data!;
  });

test("POST creates a pending circle application with its submitted data", async ({
  applicant,
}) => {
  const body = createRequest();
  const result = await applicant.POST("/api/airspace-applications", { body });
  expect(result.response.status).toBe(200);
  expect(result.data).toEqual(
    expect.objectContaining({
      category: body.category,
      lower_ft: body.lower_ft,
      upper_ft: body.upper_ft,
      label: body.label,
      remarks: body.remarks,
      boundary: body.boundary,
      status: "submitted",
      reviewer_id: null,
      reviewed_at: null,
      review_comment: null,
    }),
  );
  expect(result.data?.id).toMatch(/^[0-9a-f-]{36}$/i);
  expect(Date.parse(result.data!.starts_at)).toBe(Date.parse(body.starts_at));
  expect(Date.parse(result.data!.ends_at)).toBe(Date.parse(body.ends_at));
});

test("POST accepts a closed polygon", async ({ applicant }) => {
  const body = createRequest();
  body.boundary = {
    type: "polygon",
    vertices: [
      { latitude: 21, longitude: 115 },
      { latitude: 22, longitude: 115 },
      { latitude: 22, longitude: 116 },
      { latitude: 21, longitude: 115 },
    ],
  };
  const result = await applicant.POST("/api/airspace-applications", { body });
  expect(result.response.status).toBe(200);
  expect(result.data?.boundary).toEqual(body.boundary);
});

test("POST rejects malformed times, altitude, and boundaries", async ({
  applicant,
}) => {
  const body = createRequest();
  for (const invalid of [
    { ...body, ends_at: body.starts_at },
    { ...body, upper_ft: -1 },
    {
      ...body,
      boundary: {
        type: "circle" as const,
        center: { latitude: 91, longitude: 115 },
        radius_km: 20,
      },
    },
    {
      ...body,
      boundary: {
        type: "circle" as const,
        center: { latitude: 21, longitude: 115 },
        radius_km: 0,
      },
    },
    {
      ...body,
      boundary: {
        type: "polygon" as const,
        vertices: [
          { latitude: 21, longitude: 115 },
          { latitude: 22, longitude: 115 },
          { latitude: 22, longitude: 116 },
          { latitude: 21, longitude: 116 },
        ],
      },
    },
  ]) {
    const result = await applicant.POST("/api/airspace-applications", {
      body: invalid,
    });
    expect(result.response.status).toBe(400);
  }
});

test("POST requires the applicant role", async ({
  ordinaryUser,
  anonymous,
}) => {
  expect(
    (
      await ordinaryUser.POST("/api/airspace-applications", {
        body: createRequest(),
      })
    ).response.status,
  ).toBe(403);
  expect(
    (
      await anonymous.POST("/api/airspace-applications", {
        body: createRequest(),
      })
    ).response.status,
  ).toBe(401);
});

test("GET lists applications for directors and rejects unauthorized users", async ({
  reviewer,
  applicant,
  anonymous,
  application,
}) => {
  const listed = await reviewer.GET("/api/airspace-applications");
  expect(listed.response.status).toBe(200);
  expect(listed.data).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ id: application.id, label: application.label }),
    ]),
  );
  expect(
    (await applicant.GET("/api/airspace-applications")).response.status,
  ).toBe(403);
  expect(
    (await anonymous.GET("/api/airspace-applications")).response.status,
  ).toBe(401);
});

for (const status of ["approved", "rejected"]) {
  test(`PUT records a director's ${status} decision once`, async ({
    reviewer,
    applicant,
    anonymous,
    application,
  }) => {
    const options = {
      params: { path: { id: application.id } },
      body: { status, comment: "E2E review" },
    };
    expect(
      (await applicant.PUT("/api/airspace-applications/{id}/review", options))
        .response.status,
    ).toBe(403);
    expect(
      (await anonymous.PUT("/api/airspace-applications/{id}/review", options))
        .response.status,
    ).toBe(401);
    const reviewed = await reviewer.PUT(
      "/api/airspace-applications/{id}/review",
      options,
    );
    expect(reviewed.response.status).toBe(200);
    expect(reviewed.data).toEqual(
      expect.objectContaining({
        id: application.id,
        status,
        review_comment: "E2E review",
        reviewer_id: expect.any(String),
        reviewed_at: expect.any(String),
      }),
    );
    expect(
      (await reviewer.PUT("/api/airspace-applications/{id}/review", options))
        .response.status,
    ).toBe(400);
    const listed = await reviewer.GET("/api/airspace-applications");
    expect(listed.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: application.id, status }),
      ]),
    );
  });
}

test("PUT rejects invalid decisions and unknown application IDs", async ({
  reviewer,
  application,
}) => {
  const options: {
    params: { path: { id: string } };
    body: { status: string; comment: string | null };
  } = {
    params: { path: { id: application.id } },
    body: { status: "unknown", comment: null },
  };
  expect(
    (await reviewer.PUT("/api/airspace-applications/{id}/review", options))
      .response.status,
  ).toBe(400);
  options.params.path.id = crypto.randomUUID();
  options.body.status = "approved";
  expect(
    (await reviewer.PUT("/api/airspace-applications/{id}/review", options))
      .response.status,
  ).toBe(400);
});
