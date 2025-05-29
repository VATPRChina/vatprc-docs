import { compile, run } from "@mdx-js/mdx";
import withToc, { Toc, TocEntry } from "@stefanprobst/remark-extract-toc";
import withTocExport from "@stefanprobst/remark-extract-toc/mdx";
import Slugger from "github-slugger";
import React from "react";
import * as runtime from "react/jsx-runtime";
import rehypeExternalLinks from "rehype-external-links";
import { rehypeGithubAlerts } from "rehype-github-alerts";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkFrontmatter from "remark-frontmatter";
import gfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

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

export const TableOfContents = ({ tableOfContents, maxDepth }: { tableOfContents: Toc; maxDepth?: number }) => {
  if (!maxDepth || maxDepth <= 0) {
    return null;
  }

  if (tableOfContents?.[0]?.depth === 1) {
    return (
      <>
        {tableOfContents.map((toc: TocEntry) => (
          <React.Fragment key={toc.value}>
            <a href={`#${toc.id}`} className="font-normal no-underline">
              {toc.value}
            </a>
            <br />
            {toc.children && <TableOfContents tableOfContents={toc.children} maxDepth={maxDepth - 1} />}
          </React.Fragment>
        ))}
      </>
    );
  }

  return (
    <ul>
      {tableOfContents.map((toc: TocEntry) => (
        <li key={toc.value}>
          <a href={`#${toc.id}`} className="font-normal no-underline">
            {toc.value}
          </a>
          {toc.children && <TableOfContents tableOfContents={toc.children} maxDepth={maxDepth - 1} />}
        </li>
      ))}
    </ul>
  );
};

export const buildMarkdownDoc = async (source: string) => {
  const code = String(
    await compile(source, {
      outputFormat: "function-body",
      remarkPlugins: [gfm, withToc, withTocExport, remarkBreaks, remarkFrontmatter, remarkMdxFrontmatter],
      rehypePlugins: [
        rehypeSlug,
        rehypeGithubAlerts,
        [rehypeExternalLinks, { target: "_blank", rel: "noopener noreferrer" }],
      ],
    }),
  );

  const {
    default: MDXContent,
    tableOfContents,
    frontmatter,
  } = (await run(code, { ...runtime, baseUrl: import.meta.url })) as Awaited<ReturnType<typeof run>> & {
    tableOfContents: Toc;
    frontmatter: Record<string, unknown>;
  };

  const frontmatterTitle = typeof frontmatter?.title === "string" ? frontmatter?.title : undefined;
  const title = frontmatterTitle ?? tableOfContents?.[0]?.value;

  addIdToToc(tableOfContents);

  return { MDXContent, tableOfContents: tableOfContents, title };
};

export const MarkdownDoc: React.FC<{
  children: React.ReactNode;
  toc: Toc;
}> = ({ children, toc }) => {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="mx-auto w-full max-w-screen-lg rounded border-r px-4 py-6 md:px-12">
        <article className="prose mx-auto dark:prose-invert prose-p:my-2">{children}</article>
      </div>
      <div className="prose z-10 dark:prose-invert prose-ul:my-0 prose-li:my-0 md:sticky md:top-24 md:max-h-dvh md:overflow-y-scroll">
        <TableOfContents tableOfContents={toc} maxDepth={3} />
      </div>
    </div>
  );
};
