import { createServerFn, createServerOnlyFn } from "@tanstack/react-start";
import fs from "node:fs/promises";
import path from "node:path";

export interface DocumentEntry {
  title: string;
  path: string;
  webPath: string;
  fileName: string;
  children: DocumentEntry[];
  order?: number;
}

const findAllDocuments = createServerOnlyFn(async (prefix: string = "docs"): Promise<DocumentEntry[]> => {
  const { buildMarkdownDoc } = await import("@/components/markdown-doc-build");
  const documents = [] as DocumentEntry[];
  const dirEntries = await fs.opendir(prefix);
  for await (const entry of dirEntries) {
    if (
      entry.isFile() &&
      [".md", ".mdx"].includes(path.extname(entry.name)) &&
      entry.name.startsWith("index") === false
    ) {
      const filePath = path.resolve(entry.parentPath, entry.name);
      const fileContent = await fs.readFile(filePath, "utf-8");
      try {
        const file = await buildMarkdownDoc(fileContent);

        documents.push({
          title: file.title,
          path: filePath,
          children: [],
          webPath: "/docs/" + path.relative("docs", filePath).replace(/\.mdx?$/, ""),
          fileName: path.basename(filePath, path.extname(filePath)),
          order: typeof file.frontmatter?.order === "number" ? file.frontmatter?.order : undefined,
        });
      } catch (error) {
        console.error(`Error processing file ${entry.name}:`, error);
        documents.push({
          title: entry.name,
          path: filePath,
          children: [],
          webPath: "/docs/" + path.relative("docs", filePath).replace(/\.mdx?$/, ""),
          fileName: path.basename(filePath, path.extname(filePath)),
          order: undefined,
        });
      }
    } else if (entry.isDirectory()) {
      const indexFilePath = path.resolve(entry.parentPath, entry.name, "index.md");
      const indexExists = await fs
        .access(indexFilePath, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false);
      let title = entry.name;
      let order = undefined;
      if (indexExists) {
        const fileContent = await fs.readFile(indexFilePath, "utf-8");
        const file = await buildMarkdownDoc(fileContent);
        title = file.title;
        if (typeof file.frontmatter?.order === "number") {
          order = file.frontmatter?.order;
        }
      }
      documents.push({
        title,
        path: path.resolve(entry.parentPath, entry.name),
        children: await findAllDocuments(path.resolve(prefix, entry.name)),
        webPath: "/docs/" + path.relative("docs", path.resolve(entry.parentPath, entry.name)).replace(/\.mdx?$/, ""),
        fileName: entry.name,
        order,
      });
    }
  }
  documents.sort((a, b) => {
    if ((a.order || b.order) && (a.order ?? Number.MAX_SAFE_INTEGER) !== (b.order ?? Number.MAX_SAFE_INTEGER)) {
      return (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER);
    }
    return b.title.localeCompare(a.title);
  });
  return documents;
});

export const getAllDocuments = createServerFn().handler(async () => findAllDocuments());

export const getDocument = createServerFn()
  .inputValidator((data: string) => data)
  .handler(async (ctx) => {
    const filePath = `docs/${ctx.data}`;
    const content = await fs.readFile(filePath, "utf-8");
    return content;
  });
