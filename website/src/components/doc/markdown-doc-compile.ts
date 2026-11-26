import type { InlineNode, MarkdownDocument, MarkdownExtension } from "@tanstack/markdown";
import { autolinksExtension } from "@tanstack/markdown/extensions/autolinks";
import { calloutsExtension } from "@tanstack/markdown/extensions/callouts";
import { headingCollectionExtension } from "@tanstack/markdown/extensions/headings";
import { streamingMarkdownExtension } from "@tanstack/markdown/extensions/streaming";
import { renderHtml } from "@tanstack/markdown/html";
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
  html: string;
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
const streamingExtensions = [streamingMarkdownExtension(), ...extensions];

export const parseMarkdownDoc = (source: string, { streaming = false } = {}): MarkdownDocument => {
  const slugger = new GithubSlugger();
  return parseMarkdown(source, {
    // Existing docs use HTML tables and images. Only render them through the sanitizer below.
    allowHtml: !streaming,
    frontmatter: !streaming,
    headingIds: (text) => slugger.slug(text),
    extensions: streaming ? streamingExtensions : extensions,
    urlTransform: (_url, _kind, safeUrl) => encodeURI(safeUrl.toWellFormed()).replace(/%25(?=[\da-f]{2})/gi, "%"),
  });
};

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

export const renderMarkdownDoc = (document: MarkdownDocument): string => {
  const fragment = fromHtml(renderHtml(document, { allowHtml: true }), { fragment: true });
  const tree = sanitize(fragment, htmlSchema) as typeof fragment;
  const headingIds = new Set(document.headings?.map(({ id }) => id));
  const prefix = defaultSchema.clobberPrefix ?? "user-content-";

  const formatElements = (parent: typeof tree | Extract<(typeof tree.children)[number], { type: "element" }>) => {
    for (const node of parent.children) {
      if (node.type !== "element") {
        continue;
      }
      const { id, href } = node.properties;
      const originalId = typeof id === "string" ? id.slice(prefix.length) : "";
      // Keep existing Markdown anchors and TanStack's already-prefixed footnote IDs.
      if (/^h[1-6]$/.test(node.tagName) && headingIds.has(originalId)) {
        node.properties.id = originalId;
      }
      if (node.tagName === "li" && originalId.startsWith("user-content-fn-")) {
        node.properties.id = originalId;
      }
      if (node.tagName === "a") {
        if (node.properties.dataFootnoteRef !== undefined && originalId.startsWith("user-content-fnref-")) {
          node.properties.id = originalId;
        }
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
  const document = parseMarkdownDoc(source, options);
  const parsed: unknown = document.frontmatter === undefined ? undefined : parseYaml(document.frontmatter);
  const frontmatter =
    parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Record<string, unknown>) : {};
  const tableOfContents = buildTableOfContents(document.headings ?? []);
  const title = typeof frontmatter.title === "string" ? frontmatter.title : tableOfContents[0]?.value;
  return { html: renderMarkdownDoc(document), tableOfContents, frontmatter, title };
};
