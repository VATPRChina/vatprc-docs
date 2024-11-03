import fs from "fs/promises";
import gfm from "remark-gfm";
import withToc from "@stefanprobst/remark-extract-toc";
import withTocExport from "@stefanprobst/remark-extract-toc/mdx";
import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { glob } from "glob";
import rehypeSlug from "rehype-slug";
import Slugger from "github-slugger";
import { remarkAlert } from "remark-github-blockquote-alert";
import React from "react";

import "remark-github-blockquote-alert/alert.css";

export const generateStaticParams = async () => {
  const pages = (await glob("docs/**/*.md")).map((file) =>
    file.replace(".md", "").split("/").slice(1)
  );
  return pages.map((slug) => ({ slug }));
};

const TableOfContents = ({
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

const PostPage = async (props: any) => {
  const { slug } = await props.params;
  const file = `docs/${slug.join("/")}.md`;

  const source = await fs.readFile(file, { encoding: "utf8" });
  const code = String(
    await compile(source, {
      outputFormat: "function-body",
      remarkPlugins: [gfm, withToc, withTocExport, remarkAlert],
      rehypePlugins: [rehypeSlug],
    })
  );

  const { default: MDXContent, tableOfContents } = await run(code, {
    ...runtime,
    baseUrl: import.meta.url,
  });

  return (
    <div className="flex flex-col md:flex-row">
      <div>
        <div className="prose sticky top-16 pt-4">
          <TableOfContents
            tableOfContents={tableOfContents}
            maxDepth={3}
            slugger={new Slugger()}
          />
        </div>
      </div>
      <div className="bg-white px-4 max-w-full md:px-12 pt-4 mx-auto shadow rounded">
        <article className="prose prose-p:my-2">
          <MDXContent />
        </article>
      </div>
    </div>
  );
};

export default PostPage;
