import { runSync, run } from "@mdx-js/mdx";
import type { Toc, TocEntry } from "@stefanprobst/remark-extract-toc";
import Slugger from "github-slugger";
import * as runtime from "react/jsx-runtime";

const addIdToTocEntry = (toc: TocEntry, slugger: Slugger) => {
  toc.id = slugger.slug(toc.value);
  for (const entry of toc.children ?? []) {
    addIdToTocEntry(entry, slugger);
  }
};

export const addIdToToc = (tableOfContents: Toc) => {
  const slugger = new Slugger();
  for (const toc of tableOfContents) {
    addIdToTocEntry(toc, slugger);
  }
};

export const buildMarkdownDocSync = (code: string) => {
  const {
    default: MDXContent,
    tableOfContents,
    frontmatter,
  } = runSync(code, { ...runtime, baseUrl: import.meta.url }) as Awaited<ReturnType<typeof run>> & {
    tableOfContents: Toc;
    frontmatter: Record<string, unknown>;
  };

  const frontmatterTitle = typeof frontmatter?.title === "string" ? frontmatter?.title : undefined;
  const title = frontmatterTitle ?? tableOfContents?.[0]?.value;

  addIdToToc(tableOfContents);

  return { MDXContent, tableOfContents, title, frontmatter };
};
