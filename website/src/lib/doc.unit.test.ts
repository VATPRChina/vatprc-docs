import { getDiscourseDocument } from "./discourse";
import { getAllDocuments, getDocument } from "./doc";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import fs from "node:fs/promises";
import path from "node:path";
import { describe, expect, test, vi } from "vitest";

vi.mock("@/lib/client", () => ({ COMMUNITY_ENDPOINT: "https://community.example" }));

type CreateServerFn = typeof createServerFn<"GET">;
type CreateServerOnlyFn = typeof createServerOnlyFn;
type ServerFnBuilder = ReturnType<CreateServerFn>;

const mockServerFunctionBuider: ServerFnBuilder = vi.hoisted(() => {
  return {
    middleware: vi.fn(() => mockServerFunctionBuider),
    validator: vi.fn(() => mockServerFunctionBuider),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    handler: vi.fn((func) => func),
  } as unknown as ServerFnBuilder;
});

const mockCreateServerFn: CreateServerFn = vi.hoisted(() => {
  return vi.fn(() => mockServerFunctionBuider);
});

const mockCreateServerOnlyFn: CreateServerOnlyFn = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return vi.fn((fn) => fn);
});

vi.mock("@tanstack/react-start", async (importOriginal) => {
  return {
    ...(await importOriginal()),
    createServerFn: mockCreateServerFn,
    createServerOnlyFn: mockCreateServerOnlyFn,
  };
});

describe.concurrent("getAllDocuments", () => {
  test("should be defined", async () => {
    const documents = await getAllDocuments();
    expect(documents).toBeDefined();
    expect(documents.length).to.be.greaterThan(0);
  });
});

describe.concurrent("getDocument", async () => {
  const documents = await getAllDocuments();
  test.concurrent.each(
    documents
      .flatMap((doc) => doc.children)
      .filter((doc) => doc.children.length === 0)
      .map((doc) => [path.relative(path.resolve(import.meta.filename, "../../../../docs"), doc.path)]),
  )('should load document at path "%s"', async (docPath) => {
    const document = await getDocument({ data: docPath });
    expect(document.markdown.children.length).toBeTruthy();
  });
});

test("local and Discourse loaders deliver GeoJSON alongside their metadata", async () => {
  const point = { type: "Point", coordinates: [116, 40] };
  const source = ["# Airport", "", "```geojson", JSON.stringify(point), "```"].join("\n");
  const read = vi.spyOn(fs, "readFile").mockResolvedValueOnce(source);
  const fetch = vi
    .spyOn(globalThis, "fetch")
    .mockResolvedValueOnce(Response.json({ title: "Topic" }))
    .mockResolvedValueOnce(new Response(source));
  try {
    const local = await getDocument({ data: "airport.md" });
    expect(local.title).toBe("Airport");
    expect(local.markdown.children[1]).toMatchObject({
      type: "component",
      tagName: "geojson-map",
      properties: {
        collection: JSON.stringify({
          type: "FeatureCollection",
          features: [{ type: "Feature", properties: {}, geometry: point }],
        }),
      },
    });
    expect(await getDiscourseDocument({ data: "7188" })).toEqual({ ...local, postTitle: "Topic" });
  } finally {
    read.mockRestore();
    fetch.mockRestore();
  }
});
