import { compileMarkdownDoc } from "./markdown-doc-compile";
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
    .map((doc) => path.relative(path.resolve(import.meta.filename, "../../../../docs"), doc.path));
  return docPaths;
};

describe.concurrent("compileMarkdownDoc", async () => {
  test("extracts multiple GeoJSON maps, including nested fences", async () => {
    const point = '{"type":"Point","coordinates":[116.6,40.1]}';
    const doc = await compileMarkdownDoc(
      `# Map\n\n\`\`\`geojson\n${point}\n\`\`\`\n\n> \`\`\`geojson\n> ${point}\n> \`\`\``,
    );
    expect(doc.geojson).toHaveLength(2);
    expect(doc.html).toContain('data-markdown-geojson="0"');
    expect(doc.html).toContain('data-markdown-geojson="1"');
    expect(doc.html).toContain("<details><summary>GeoJSON</summary>");
    expect(doc.geojson[0].features[0].geometry).toEqual({ type: "Point", coordinates: [116.6, 40.1] });
  });

  test("leaves invalid GeoJSON and ordinary JSON fences as code", async () => {
    const doc = await compileMarkdownDoc(
      '```geojson\n{"type":"Point","coordinates":[0]}\n```\n\n```json\n{"type":"Point","coordinates":[0,0]}\n```',
    );
    expect(doc.geojson).toEqual([]);
    expect(doc.html).toContain('class="language-geojson"');
    expect(doc.html).toContain('class="language-json"');
    expect(doc.html).not.toContain("data-markdown-geojson");
  });

  test("escapes GeoJSON properties and strips forged map placeholders", async () => {
    const source = JSON.stringify({
      type: "Feature",
      properties: { name: "<script>alert(1)</script>" },
      geometry: { type: "Point", coordinates: [0, 0] },
    });
    const doc = await compileMarkdownDoc(
      "```geojson\n" + source + '\n```\n\n<div data-markdown-geojson="0">forged</div>',
    );
    expect(doc.geojson).toHaveLength(1);
    expect(doc.html.match(/data-markdown-geojson/g)).toHaveLength(1);
    expect(doc.html).not.toContain("<script>");
    expect(JSON.parse(JSON.stringify(doc))).toEqual(doc);
  });

  test("extracts YAML metadata and falls back to the first heading", async () => {
    const doc = await compileMarkdownDoc('---\ntitle: "Document title"\norder: 0\n---\n# Heading');
    expect(doc.title).toBe("Document title");
    expect(doc.frontmatter).toEqual({ title: "Document title", order: 0 });
    expect(doc.html).toBe('<h1 id="heading">Heading</h1>');
    expect(doc.tableOfContents).toEqual([{ depth: 1, value: "Heading" }]);
    expect((await compileMarkdownDoc("# Heading")).title).toBe("Heading");
    expect((await compileMarkdownDoc("No heading")).title).toBeUndefined();
  });

  test("renders Markdown features and unique heading anchors", async () => {
    const doc = await compileMarkdownDoc(
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
  });

  test("preserves raw HTML tables, images and literal Markdown text", async () => {
    const doc = await compileMarkdownDoc(
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

  test("strips executable HTML and treats MDX expressions as text", async () => {
    const doc = await compileMarkdownDoc(
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
      ].join("\n"),
    );
    expect(doc.html).toContain("{globalThis.alert('expression')}");
    expect(doc.html).not.toMatch(/<script|onerror|javascript:|<iframe/);
  });

  test.concurrent.each(await getAllDocumentPaths())('can compile doc at "%s"', async (docPath) => {
    const document = await getDocument({ data: docPath });
    const markdown = await compileMarkdownDoc(document);

    expect(markdown.html).toBeTruthy();
    expect(markdown.title).toBeTruthy();
    expect(JSON.parse(JSON.stringify(markdown))).toEqual(markdown);
  });
});
