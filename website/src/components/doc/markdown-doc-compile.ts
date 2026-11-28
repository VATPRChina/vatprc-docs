import { geojsonExtension } from "./extension/geojson-extension";
import { mapBlocks } from "./markdown-blocks";
import type { InlineNode, MarkdownDocument, MarkdownExtension } from "@tanstack/markdown";
import { autolinksExtension } from "@tanstack/markdown/extensions/autolinks";
import { calloutsExtension } from "@tanstack/markdown/extensions/callouts";
import { headingCollectionExtension } from "@tanstack/markdown/extensions/headings";
import { streamingMarkdownExtension } from "@tanstack/markdown/extensions/streaming";
import { renderInline } from "@tanstack/markdown/html";
import { parseMarkdown } from "@tanstack/markdown/parser";
import GithubSlugger from "github-slugger";
import { fromHtml } from "hast-util-from-html";
import { defaultSchema, sanitize, type Schema } from "hast-util-sanitize";
import { toHtml } from "hast-util-to-html";
import { parse as parseYaml } from "yaml";

interface TocEntry {
  depth: number;
  value: string;
  children?: TocEntry[];
}

export interface CompiledMarkdownDoc {
  markdown: MarkdownDocument;
  tableOfContents: TocEntry[];
  frontmatter: Record<string, unknown>;
  title: string | undefined;
}

const withLineBreaks = (nodes: InlineNode[]): InlineNode[] =>
  nodes.flatMap((node): InlineNode[] => {
    if ("children" in node) {
      return [{ ...node, children: withLineBreaks(node.children) }];
    }
    if (node.type !== "text" || !node.value.includes("\n")) {
      return [node];
    }
    return node.value
      .split("\n")
      .flatMap((value, index): InlineNode[] =>
        index === 0 ? [{ type: "text", value }] : [{ type: "break" }, { type: "text", value }],
      );
  });

const extensions: MarkdownExtension[] = [
  {
    ...autolinksExtension(),
    parseBlock({ lines, index, options, consume, parseInline }) {
      const line = lines[index];
      // With HTML parsing enabled, the block parser can mistake an angle autolink for a tag.
      if (options.allowHtml && /^ {0,3}<https?:\/\/[^<>\s]+>\s*$/i.test(line)) {
        consume(1);
        return { type: "paragraph", children: parseInline(line.trim()) };
      }
    },
  },
  calloutsExtension(),
  { name: "line-breaks", transformInline: withLineBreaks },
  headingCollectionExtension(),
];
const htmlSchema: Schema = {
  ...defaultSchema,
  tagNames: [...(defaultSchema.tagNames ?? []), "figure", "figcaption"],
  attributes: {
    ...defaultSchema.attributes,
    div: [
      ...(defaultSchema.attributes?.div ?? []),
      ["className", "markdown-alert", "markdown-alert-content", /^markdown-alert-[a-z]+$/],
    ],
    details: [["className", "markdown-alert", /^markdown-alert-[a-z]+$/]],
    p: [["className", "markdown-alert-title"]],
    summary: [...(defaultSchema.attributes?.summary ?? []), ["className", "markdown-alert-title"]],
    figure: [["className", "tm-code-frame"], "dataLang"],
    pre: [["className", "tm-code"], "dataLang", "dataMeta", "dataCodeTitle", "dataFilename", "dataFramework"],
    table: [...(defaultSchema.attributes?.table ?? []), ["style", "text-align:center; border-collapse:collapse"]],
    td: [["style", /^text-align:(left|center|right)$/]],
    th: [["style", /^text-align:(left|center|right)$/]],
  },
};

const sanitizeHtml = (html: string): string => {
  const fragment = fromHtml(html, { fragment: true });
  const tree = sanitize(fragment, htmlSchema) as typeof fragment;
  const formatElements = (parent: typeof tree | Extract<(typeof tree.children)[number], { type: "element" }>) => {
    for (const node of parent.children) {
      if (node.type !== "element") continue;
      if (node.tagName === "a") {
        const { href } = node.properties;
        if (typeof href === "string" && /^(https?:)?\/\//i.test(href)) {
          node.properties.target = "_blank";
          node.properties.rel = ["noopener", "noreferrer"];
        }
      }
      formatElements(node);
    }
  };

  formatElements(tree);
  return toHtml(tree);
};

const containsHtml = (node: InlineNode): boolean =>
  node.type === "inlineHtml" || ("children" in node && node.children.some(containsHtml));

const sanitizeInlines = (nodes: InlineNode[]): InlineNode[] =>
  nodes.some(containsHtml)
    ? [
        {
          type: "inlineHtml",
          value: sanitizeHtml(nodes.map((node) => renderInline(node, { allowHtml: true })).join("")),
        },
      ]
    : nodes;

const htmlExtension: MarkdownExtension = {
  name: "sanitized-html",
  transformDocument(document) {
    return {
      ...document,
      children: mapBlocks(document.children, (node) => {
        switch (node.type) {
          case "html":
            return { ...node, value: sanitizeHtml(node.value) };
          case "heading":
          case "paragraph":
            return { ...node, children: sanitizeInlines(node.children) };
          case "table": {
            const cleanCell = (cell: (typeof node.header)[number]) => ({
              ...cell,
              children: sanitizeInlines(cell.children),
            });
            return { ...node, header: node.header.map(cleanCell), rows: node.rows.map((row) => row.map(cleanCell)) };
          }
          default:
            return node;
        }
      }),
    };
  },
};

const buildTableOfContents = (headings: NonNullable<MarkdownDocument["headings"]>): TocEntry[] => {
  const root = { depth: 0, value: "", children: [] as TocEntry[] };
  const parents: TocEntry[] = [root];
  for (const { level, text } of headings) {
    while (parents[parents.length - 1].depth >= level) {
      parents.pop();
    }
    const parent = parents[parents.length - 1];
    const entry = { depth: level, value: text };
    (parent.children ??= []).push(entry);
    parents.push(entry);
  }
  return root.children;
};

export const compileMarkdownDoc = (source: string, options?: { streaming?: boolean }): CompiledMarkdownDoc => {
  const slugger = new GithubSlugger();
  const streaming = options?.streaming ?? false;
  const document = parseMarkdown(source, {
    allowHtml: !streaming,
    frontmatter: !streaming,
    headingIds: (text) => slugger.slug(text),
    extensions: [
      ...(streaming ? [streamingMarkdownExtension()] : []),
      ...extensions,
      htmlExtension,
      geojsonExtension(),
    ],
    urlTransform: (_url, _kind, safeUrl) => encodeURI(safeUrl.toWellFormed()).replace(/%25(?=[\da-f]{2})/gi, "%"),
  });
  const parsed: unknown = document.frontmatter === undefined ? undefined : parseYaml(document.frontmatter);
  const frontmatter =
    parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  const tableOfContents = buildTableOfContents(document.headings ?? []);
  const title = typeof frontmatter.title === "string" ? frontmatter.title : tableOfContents[0]?.value;
  return { markdown: { type: "root", children: document.children }, tableOfContents, frontmatter, title };
};
