import { compile, run, runSync } from "@mdx-js/mdx";
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

export const TableOfContents: React.FC<{ tableOfContents: Toc; maxDepth?: number }> = ({
  tableOfContents,
  maxDepth,
}) => {
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

export const compileMarkdownDoc = async (source: string) => {
  source = source.replaceAll("<-", "{'<-'}");

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

  return code;
};

export const buildMarkdownDoc = async (source: string) => {
  const code = await compileMarkdownDoc(source);

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

  return { MDXContent, tableOfContents: tableOfContents, title, frontmatter };
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

  return { MDXContent, tableOfContents: tableOfContents, title, frontmatter };
};

export const MarkdownDoc: React.FC<{
  children: React.ReactNode;
  toc: Toc;
}> = ({ children, toc }) => {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="px-4 py-6 md:flex-2/3 md:px-12">
        <article className="prose dark:prose-invert prose-p:my-2 mx-auto">{children}</article>
      </div>
      <div className="prose dark:prose-invert prose-ul:my-0 prose-li:my-0 z-10 md:sticky md:top-24 md:max-h-dvh md:flex-1/3 md:overflow-y-scroll">
        <TableOfContents tableOfContents={toc} maxDepth={3} />
      </div>
    </div>
  );
};
