import { getAllDocuments, getDocument } from "./doc";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import path from "node:path";
import { describe, expect, test, vi } from "vitest";

type CreateServerFn = typeof createServerFn<"GET">;
type CreateServerOnlyFn = typeof createServerOnlyFn;
type ServerFnBuilder = ReturnType<CreateServerFn>;

const mockServerFunctionBuider: ServerFnBuilder = vi.hoisted(() => {
  return {
    middleware: vi.fn(() => mockServerFunctionBuider),
    inputValidator: vi.fn(() => mockServerFunctionBuider),
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
      .map((doc) => [path.relative(path.resolve(import.meta.filename, "../../../docs"), doc.path)]),
  )('should load document at path "%s"', async (docPath) => {
    const document = await getDocument({ data: docPath });
    expect(document).toBeDefined();
    expect(document).length.to.be.greaterThan(0);
  });
});
