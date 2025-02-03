import { evaluate } from "@mdx-js/mdx";
import withToc, { Toc } from "@stefanprobst/remark-extract-toc";
import withTocExport from "@stefanprobst/remark-extract-toc/mdx";
import fs from "node:fs/promises";
import path from "node:path";
import * as runtime from "react/jsx-runtime";
import { rehypeGithubAlerts } from "rehype-github-alerts";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkFrontmatter from "remark-frontmatter";
import gfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

export interface DocumentEntry {
  title: string;
  path: string;
  webPath: string;
  fileName: string;
  children: DocumentEntry[];
  order?: number;
}

export interface Document {
  title: string;
  tableOfContents: Toc;
  frontmatter?: Record<string, unknown>;
  content: Awaited<ReturnType<typeof evaluate>>["default"];
}

const evaluateMdx = async (source: string) => {
  return evaluate(source, {
    // compile-time
    remarkPlugins: [
      gfm,
      withToc,
      withTocExport,
      remarkBreaks,
      remarkFrontmatter,
      remarkMdxFrontmatter,
    ],
    rehypePlugins: [rehypeSlug, rehypeGithubAlerts],
    // run-time
    ...runtime,
    baseUrl: path.resolve(import.meta.url, "../../"),
  }) as Promise<
    Awaited<ReturnType<typeof evaluate>> & {
      tableOfContents: Toc;
      frontmatter: Record<string, unknown>;
    }
  >;
};

export const getAllDocuments = async (
  prefix = "docs",
): Promise<DocumentEntry[]> => {
  const documents = [] as DocumentEntry[];
  const dirEntries = await fs.opendir(prefix);
  for await (const entry of dirEntries) {
    if (
      entry.isFile() &&
      [".md", ".mdx"].includes(path.extname(entry.name)) &&
      entry.name.startsWith("index") === false
    ) {
      const filePath = path.resolve(entry.parentPath, entry.name);
      const file = await parseFile(filePath);

      documents.push({
        title: file.title,
        path: filePath,
        children: [],
        webPath:
          "/docs/" + path.relative("docs", filePath).replace(/\.mdx?$/, ""),
        fileName: path.basename(filePath, path.extname(filePath)),
        order:
          typeof file.frontmatter?.order === "number"
            ? file.frontmatter?.order
            : undefined,
      });
    } else if (entry.isDirectory()) {
      const indexFilePath = path.resolve(
        entry.parentPath,
        entry.name,
        "index.md",
      );
      const indexExists = await fs
        .access(indexFilePath, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);
      let title = entry.name;
      let order = undefined;
      if (indexExists) {
        const file = await parseFile(indexFilePath);
        title = file.title;
        if (typeof file.frontmatter?.order === "number") {
          order = file.frontmatter?.order;
        }
      }
      documents.push({
        title,
        path: path.resolve(entry.parentPath, entry.name),
        children: await getAllDocuments(path.resolve(prefix, entry.name)),
        webPath:
          "/docs/" +
          path
            .relative("docs", path.resolve(entry.parentPath, entry.name))
            .replace(/\.mdx?$/, ""),
        fileName: entry.name,
        order,
      });
    }
  }
  documents.sort((a, b) => {
    if (
      (a.order || b.order) &&
      (a.order ?? Number.MAX_SAFE_INTEGER) !==
        (b.order ?? Number.MAX_SAFE_INTEGER)
    ) {
      return (
        (a.order ?? Number.MAX_SAFE_INTEGER) -
        (b.order ?? Number.MAX_SAFE_INTEGER)
      );
    }
    return a.title.localeCompare(b.title);
  });
  return documents;
};

export const parseFile = async (filePath: string): Promise<Document> => {
  const source = await fs.readFile(filePath, { encoding: "utf8" });
  const {
    default: MDXContent,
    tableOfContents,
    frontmatter,
  } = await evaluateMdx(source);

  const frontmatterTitle =
    typeof frontmatter?.title === "string" ? frontmatter?.title : undefined;
  const title =
    frontmatterTitle ??
    tableOfContents?.[0]?.value ??
    path.basename(filePath, path.extname(filePath));

  return {
    title: title,
    tableOfContents: tableOfContents,
    content: MDXContent,
    frontmatter,
  };
};
