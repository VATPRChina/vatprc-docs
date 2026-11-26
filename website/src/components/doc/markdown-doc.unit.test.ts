import { MarkdownContent } from "./markdown-content";
import { compileMarkdownDoc } from "./markdown-doc-compile";
import { getAllDocuments, getDocument } from "@/lib/doc";
import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, test, vi } from "vitest";

const renderDoc = (doc: Pick<ReturnType<typeof compileMarkdownDoc>, "markdown">) =>
  renderToStaticMarkup(createElement(MarkdownContent, doc));

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
    expect(renderDoc(doc)).toBe('<h1 id="heading">Heading</h1>');
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
    const html = renderDoc(doc);
    expect(html).toContain('id="标题"');
    expect(html).toContain('id="标题-1"');
    expect(html).toContain("<table>");
    expect(html).toContain('type="checkbox"');
    expect(html).toContain("markdown-alert-note");
    expect(html).toContain("<p>Alert</p>");
    expect(html).toContain("<br/>");
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('<a href="#%E6%A0%87%E9%A2%98">local</a>');
    expect(html).toContain('href="https://example.com/standalone"');
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
    const html = renderDoc(doc);
    expect(html).toContain("{value} &#x3C;- text<br>next");
    expect(html).toContain('style="text-align:center; border-collapse:collapse"');
    expect(html).toContain('rowspan="2"');
    expect(html).toContain('cellpadding="6"');
    expect(html).toContain('src="https://example.com/image.png"');
  });

  test("strips executable HTML and treats MDX expressions as text", () => {
    const doc = compileMarkdownDoc(
      [
        "{globalThis.alert('expression')}",
        "",
        "**Nested <img src=x onerror=alert(1)>**",
        "",
        "| Cell |",
        "| --- |",
        "| **<img src=x onerror=alert(1)>** |",
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
    const html = renderDoc(doc);
    expect(html).toContain("{globalThis.alert(&#x27;expression&#x27;)}");
    expect(html).not.toMatch(/<script|onerror|javascript:|<iframe/);
  });

  test("renders the same HTML from a serialized document", () => {
    const source = "# Heading\n\n### Nested\n\nA footnote[^note].\n\n[^note]: Footnote";
    const doc = compileMarkdownDoc(source);
    const restored = JSON.parse(JSON.stringify(doc)) as typeof doc;

    expect(doc.tableOfContents).toEqual([{ depth: 1, value: "Heading", children: [{ depth: 3, value: "Nested" }] }]);
    const html = renderDoc(doc);
    expect(renderDoc(restored)).toBe(html);
    expect(html).toContain('href="#user-content-fn-note"');
    expect(html).toContain('id="user-content-fn-note"');
    expect(html).toContain('href="#user-content-fnref-note"');
    expect(html).toContain('id="user-content-fnref-note"');
    expect(html).toContain('aria-describedby="footnote-label"');
    expect(html).toContain('id="footnote-label"');
  });

  test("reparses accumulated streaming text and escapes raw HTML", () => {
    const streaming = { streaming: true };
    const partial = "# Response\n\n<img src=x>\n\n-";
    const complete = partial + " Completed";

    const incomplete = compileMarkdownDoc(partial, streaming);
    expect(renderDoc(incomplete)).not.toContain("<ul>");
    expect(renderDoc(incomplete)).toContain("&lt;img src=x&gt;");
    expect(renderDoc(compileMarkdownDoc(complete, streaming))).toContain("<li>Completed</li>");
    expect(compileMarkdownDoc(partial, streaming)).toEqual(incomplete);
  });

  test.concurrent.each(await getAllDocumentPaths())('can compile doc at "%s"', async (docPath) => {
    const markdown = await getDocument({ data: docPath });

    expect(markdown.markdown.children.length).toBeTruthy();
    expect(markdown.title).toBeTruthy();
    expect(renderDoc(JSON.parse(JSON.stringify(markdown)) as typeof markdown)).toBe(renderDoc(markdown));
  });
});

test("compiles nested GeoJSON fences in order and retains escaped source on the server", () => {
  const point = { type: "Point", coordinates: [1, 2] };
  const feature = { type: "Feature", geometry: point, properties: { name: "<img src=x>" } };
  const doc = compileMarkdownDoc(
    [
      '<div data-geojson-index="0"></div>',
      "",
      `<pre data-lang="geojson"><code>${JSON.stringify(point)}</code></pre>`,
      "",
      "> ```geojson",
      "> " + JSON.stringify(feature),
      "> ```",
      "",
      "- Map",
      "",
      "  ```geojson",
      "  " + JSON.stringify(point),
      "  ```",
      "",
      "```json",
      JSON.stringify(point),
      "```",
      "",
      "```geojson",
      "{broken}",
      "```",
    ].join("\n"),
  );
  const ssr = renderDoc(doc);
  expect(ssr).toContain(`<pre data-lang="geojson"><code>${JSON.stringify(point)}</code></pre>`);
  const quote = doc.markdown.children.find((node) => node.type === "blockquote");
  expect(quote?.children[0]).toMatchObject({
    type: "component",
    properties: { collection: JSON.stringify({ type: "FeatureCollection", features: [feature] }) },
  });
  expect(ssr).not.toContain("data-geojson-index");
  expect(ssr).toMatch(/<blockquote>[\s\S]*?class="language-geojson"[\s\S]*?<\/blockquote>/);
  expect(ssr).toMatch(/<li>[\s\S]*?class="language-geojson"[\s\S]*?<\/li>/);
  expect(ssr).toMatch(/class="language-geojson">[\s\S]*?class="th-token th-property">&quot;type&quot;/);
  expect(ssr).toContain("&lt;img src=x&gt;");
  expect(ssr).toContain('class="language-geojson"><span class="th-line" data-line="1">{broken}</span></code></pre>');
  expect(ssr).toContain('class="language-json">');
  expect(ssr).not.toContain("<canvas");
});

test("highlights declared languages and line metadata, and escapes unknown fences", () => {
  const html = renderDoc(
    compileMarkdownDoc(
      ["```ts {2}", "const a = 1;", "const b = 2;", "```", "", "```unknown-language", "<img src=x>", "```"].join("\n"),
    ),
  );
  expect(html).toContain('class="th-token th-keyword">const</span>');
  expect(html).toContain('class="th-line th-line--highlighted" data-line="2"');
  expect(html).toContain(
    'class="language-unknown-language"><span class="th-line" data-line="1">&lt;img src=x&gt;</span>',
  );
});
