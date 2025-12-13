import { buildMarkdownDoc, buildMarkdownDocSync, compileMarkdownDoc } from "./markdown-doc-build";
import { getAllDocuments, getDocument } from "@/lib/doc";
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

const getAllDocumentPaths = async () => {
  const documents = await getAllDocuments();
  const docPaths = documents
    .flatMap((doc) => doc.children)
    .filter((doc) => doc.children.length === 0)
    .map((doc) => path.relative(path.resolve(import.meta.filename, "../../../docs"), doc.path));
  return docPaths;
};

describe.concurrent("compileMarkdownDoc", async () => {
  test.concurrent.each(await getAllDocumentPaths())('can compile doc at "%s"', async (docPath) => {
    const document = await getDocument({ data: docPath });
    const markdown = await compileMarkdownDoc(document);

    expect(markdown).toBeDefined();
  });
});

describe.concurrent("buildMarkdownDoc", async () => {
  test.concurrent.each(await getAllDocumentPaths())('can build doc at "%s"', async (docPath) => {
    const document = await getDocument({ data: docPath });
    const built = await buildMarkdownDoc(document);

    expect(built).toBeDefined();
    expect(built.MDXContent).toBeDefined();
    expect(built.title).toBeDefined();
  });
});

describe.concurrent("buildMarkdownDocSync", async () => {
  test.concurrent.each(await getAllDocumentPaths())('can build doc at "%s"', async (docPath) => {
    const document = await getDocument({ data: docPath });
    const markdown = await compileMarkdownDoc(document);
    const built = buildMarkdownDocSync(markdown);

    expect(built).toBeDefined();
    expect(built.MDXContent).toBeDefined();
    expect(built.title).toBeDefined();
  });
});
