import { compileMarkdownDoc, parseMarkdownDoc, renderMarkdownDoc } from "./markdown-doc-compile";
import { getAllDocuments, getDocument } from "@/lib/doc";
import type { MarkdownDocument } from "@tanstack/markdown";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import path from "node:path";
import { describe, expect, test, vi } from "vitest";

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

const getAllDocumentPaths = async () => {
  const documents = await getAllDocuments();
  const docPaths = documents
    .flatMap((doc) => doc.children)
    .filter((doc) => doc.children.length === 0)
    .map((doc) => path.relative(path.resolve(import.meta.filename, "../../../../../docs"), doc.path));
  return docPaths;
};

describe.concurrent("compileMarkdownDoc", async () => {
  test("extracts YAML metadata and falls back to the first heading", () => {
    const doc = compileMarkdownDoc('---\ntitle: "Document title"\norder: 0\n---\n# Heading');
    expect(doc.title).toBe("Document title");
    expect(doc.frontmatter).toEqual({ title: "Document title", order: 0 });
    expect(doc.html).toBe('<h1 id="heading">Heading</h1>');
    expect(doc.tableOfContents).toEqual([{ depth: 1, value: "Heading" }]);
    expect(compileMarkdownDoc("# Heading").title).toBe("Heading");
    expect(compileMarkdownDoc("No heading").title).toBeUndefined();
  });

  test("renders Markdown features and unique heading anchors", () => {
    const doc = compileMarkdownDoc(
      [
        "# 标题",
        "# 标题",
        "",
        "| A | B |",
        "| - | - |",
        "| 1 | 2 |",
        "",
        "- [x] Done",
        "",
        "> [!NOTE]",
        "> Alert",
        "",
        "line one",
        "line two",
        "",
        "[external](https://example.com) [local](#标题)",
        "",
        "<https://example.com/standalone>",
      ].join("\n"),
    );
    expect(doc.html).toContain('id="标题"');
    expect(doc.html).toContain('id="标题-1"');
    expect(doc.html).toContain("<table>");
    expect(doc.html).toContain('type="checkbox"');
    expect(doc.html).toContain("markdown-alert-note");
    expect(doc.html).toContain("<p>Alert</p>");
    expect(doc.html).toContain("<br>");
    expect(doc.html).toContain('target="_blank"');
    expect(doc.html).toContain('rel="noopener noreferrer"');
    expect(doc.html).toContain('<a href="#%E6%A0%87%E9%A2%98">local</a>');
    expect(doc.html).toContain('href="https://example.com/standalone"');
  });

  test("preserves raw HTML tables, images and literal Markdown text", () => {
    const doc = compileMarkdownDoc(
      [
        "# Test",
        "",
        "{value} <- text<br>next",
        "",
        '<table style="text-align:center; border-collapse:collapse" border="1" cellpadding="6"><tr><td rowspan="2">Cell</td></tr></table>',
        "",
        '<img src="https://example.com/image.png" width="100" alt="image">',
      ].join("\n"),
    );
    expect(doc.html).toContain("{value} &#x3C;- text<br>next");
    expect(doc.html).toContain('style="text-align:center; border-collapse:collapse"');
    expect(doc.html).toContain('rowspan="2"');
    expect(doc.html).toContain('cellpadding="6"');
    expect(doc.html).toContain('src="https://example.com/image.png"');
  });

  test("strips executable HTML and treats MDX expressions as text", () => {
    const doc = compileMarkdownDoc(
      [
        "{globalThis.alert('expression')}",
        "",
        "<script>alert('script')</script>",
        "",
        '<img src="https://example.com/image.png" onerror="alert(1)">',
        "",
        '<a href="javascript:alert(1)">unsafe</a>',
        "",
        '<iframe src="https://example.com"></iframe>',
        "",
        "[unsafe Markdown link](javascript:alert(1))",
      ].join("\n"),
    );
    expect(doc.html).toContain("{globalThis.alert('expression')}");
    expect(doc.html).not.toMatch(/<script|onerror|javascript:|<iframe/);
  });

  test("renders the same HTML from a serialized document", () => {
    const source = "# Heading\n\n### Nested\n\nA footnote[^note].\n\n[^note]: Footnote";
    const document = parseMarkdownDoc(source);
    const restored = JSON.parse(JSON.stringify(document)) as MarkdownDocument;
    const doc = compileMarkdownDoc(source);

    expect(doc.tableOfContents).toEqual([{ depth: 1, value: "Heading", children: [{ depth: 3, value: "Nested" }] }]);
    expect(renderMarkdownDoc(restored)).toBe(doc.html);
    expect(doc.html).toContain('href="#user-content-fn-note"');
    expect(doc.html).toContain('id="user-content-fn-note"');
    expect(doc.html).toContain('href="#user-content-fnref-note"');
    expect(doc.html).toContain('id="user-content-fnref-note"');
    expect(doc.html).toContain('aria-describedby="user-content-footnote-label"');
    expect(doc.html).toContain('id="user-content-footnote-label"');
  });

  test("reparses accumulated streaming text and escapes raw HTML", () => {
    const streaming = { streaming: true };
    const partial = "# Response\n\n<img src=x>\n\n-";
    const complete = partial + " Completed";

    const incomplete = compileMarkdownDoc(partial, streaming);
    expect(incomplete.html).not.toContain("<ul>");
    expect(incomplete.html).toContain("&#x3C;img src=x>");
    expect(compileMarkdownDoc(complete, streaming).html).toContain("<li>Completed</li>");
    expect(compileMarkdownDoc(partial, streaming)).toEqual(incomplete);
  });

  test.concurrent.each(await getAllDocumentPaths())('can compile doc at "%s"', async (docPath) => {
    const markdown = await getDocument({ data: docPath });

    expect(markdown.html).toBeTruthy();
    expect(markdown.title).toBeTruthy();
    expect(JSON.parse(JSON.stringify(markdown))).toEqual(markdown);
  });
});
