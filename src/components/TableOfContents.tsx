import Slugger from "github-slugger";
import React from "react";

export const TableOfContents = ({
  tableOfContents,
  maxDepth,
  slugger,
}: {
  tableOfContents: any;
  maxDepth?: number;
  slugger: Slugger;
}) => {
  if (!maxDepth || maxDepth <= 0) {
    return null;
  }

  if (tableOfContents?.[0].depth === 1) {
    return (
      <>
        {tableOfContents.map((toc: any) => (
          <React.Fragment key={toc.value}>
            <a
              href={"#" + slugger.slug(toc.value)}
              className="font-normal no-underline"
            >
              {toc.value}
            </a>
            <br />
            {toc.children && (
              <TableOfContents
                tableOfContents={toc.children}
                maxDepth={maxDepth - 1}
                slugger={slugger}
              />
            )}
          </React.Fragment>
        ))}
      </>
    );
  }

  return (
    <ul>
      {tableOfContents.map((toc: any) => (
        <li key={toc.value}>
          <a
            href={"#" + slugger.slug(toc.value)}
            className="font-normal no-underline"
          >
            {toc.value}
          </a>
          {toc.children && (
            <TableOfContents
              tableOfContents={toc.children}
              maxDepth={maxDepth - 1}
              slugger={slugger}
            />
          )}
        </li>
      ))}
    </ul>
  );
};
