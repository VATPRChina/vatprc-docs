import { parseGeojson } from "./geojson";
import withToc, { type Toc } from "@stefanprobst/remark-extract-toc";
import type { Root as HtmlRoot } from "hast";
import type { Root } from "mdast";
import rehypeExternalLinks from "rehype-external-links";
import { rehypeGithubAlerts } from "rehype-github-alerts";
import rehypeRaw from "rehype-raw";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeStringify from "rehype-stringify";
import remarkBreaks from "remark-breaks";
import remarkFrontmatter from "remark-frontmatter";
import gfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";
import { parse as parseYaml } from "yaml";

export interface CompiledMarkdownDoc {
  html: string;
  geojson: GeoJSON.FeatureCollection[];
  tableOfContents: Toc;
  frontmatter: Record<string, unknown>;
  title: string | undefined;
}

export const compileMarkdownDoc = async (source: string): Promise<CompiledMarkdownDoc> => {
  const geojson: GeoJSON.FeatureCollection[] = [];
  let frontmatter: Record<string, unknown> = {};
  const file = await unified()
    .use(remarkParse)
    .use(gfm)
    .use(withToc)
    .use(remarkBreaks)
    .use(remarkFrontmatter)
    .use(() => (tree: Root) => {
      for (const node of tree.children) {
        if (node.type === "yaml") {
          const parsed: unknown = parseYaml(node.value);
          if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
            frontmatter = parsed as Record<string, unknown>;
          }
        }
      }
    })
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeGithubAlerts, {})
    .use(rehypeRaw)
    // Keep alert markup while sanitizing source HTML, then add heading IDs and link attributes.
    .use(rehypeSanitize, {
      ...defaultSchema,
      tagNames: [...(defaultSchema.tagNames ?? []), "svg", "path"],
      attributes: {
        ...defaultSchema.attributes,
        div: [
          ...(defaultSchema.attributes?.div ?? []),
          ["className", "markdown-alert", /^markdown-alert-(note|tip|important|warning|caution)$/],
        ],
        p: [["className", "markdown-alert-title"]],
        svg: [
          "viewBox",
          "version",
          "width",
          "height",
          "ariaHidden",
          ["className", "octicon", /^octicon-(info|report|alert|light-bulb|stop)$/, "mr-2"],
        ],
        path: ["d"],
        table: [...(defaultSchema.attributes?.table ?? []), ["style", "text-align:center; border-collapse:collapse"]],
      },
    })
    .use(rehypeSlug)
    .use(rehypeExternalLinks, { target: "_blank", rel: "noopener noreferrer" })
    .use(() => (tree: HtmlRoot) => {
      visit(tree, "element", (node, index, parent) => {
        if (node.tagName !== "pre" || !parent || index === undefined) return;
        const code = node.children[0];
        if (
          code?.type !== "element" ||
          code.tagName !== "code" ||
          !Array.isArray(code.properties.className) ||
          !code.properties.className.includes("language-geojson")
        )
          return;
        const source = code.children
          .filter((child) => child.type === "text")
          .map((child) => child.value)
          .join("");
        const data = parseGeojson(source);
        if (!data) return;
        const mapIndex = geojson.push(data) - 1;
        parent.children[index] = {
          type: "element",
          tagName: "div",
          properties: { dataMarkdownGeojson: mapIndex },
          children: [
            {
              type: "element",
              tagName: "details",
              properties: {},
              children: [
                { type: "element", tagName: "summary", properties: {}, children: [{ type: "text", value: "GeoJSON" }] },
                node,
              ],
            },
          ],
        };
      });
    })
    .use(rehypeStringify)
    .process(source);

  const tableOfContents = file.data.toc ?? [];
  const title = typeof frontmatter.title === "string" ? frontmatter.title : tableOfContents[0]?.value;
  return { html: String(file), geojson, tableOfContents, frontmatter, title };
};
