import type { Toc, TocEntry } from "@stefanprobst/remark-extract-toc";
import type React from "react";
import { Fragment } from "react";

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
          <Fragment key={toc.value}>
            <a href={`#${toc.id}`} className="font-normal no-underline">
              {toc.value}
            </a>
            <br />
            {toc.children && <TableOfContents tableOfContents={toc.children} maxDepth={maxDepth - 1} />}
          </Fragment>
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
