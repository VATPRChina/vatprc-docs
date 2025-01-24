import { PageProps } from "@/utils";
import { compile, run } from "@mdx-js/mdx";
import withToc, { Toc, TocEntry } from "@stefanprobst/remark-extract-toc";
import withTocExport from "@stefanprobst/remark-extract-toc/mdx";
import fs from "fs/promises";
import Slugger from "github-slugger";
import { glob } from "glob";
import { getTranslations, setRequestLocale } from "next-intl/server";
import React from "react";
import * as runtime from "react/jsx-runtime";
import { rehypeGithubAlerts } from "rehype-github-alerts";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkFrontmatter from "remark-frontmatter";
import gfm from "remark-gfm";

export const generateStaticParams = async () => {
  const pages = (await glob("docs/**/*.md")).map((file) =>
    file.replace(".md", "").split("/").slice(1),
  );
  return pages.map((slug) => ({ slug }));
};

const TableOfContents = ({
  tableOfContents,
  maxDepth,
  slugger,
}: {
  tableOfContents: Toc;
  maxDepth?: number;
  slugger: Slugger;
}) => {
  if (!maxDepth || maxDepth <= 0) {
    return null;
  }

  if (tableOfContents?.[0].depth === 1) {
    return (
      <>
        {tableOfContents.map((toc: TocEntry) => (
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
      {tableOfContents.map((toc: TocEntry) => (
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

const PostPage = async (props: PageProps<"locale" | "...slug">) => {
  const { slug, locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Docs.Single");

  const file = `docs/${slug.join("/")}.md`;

  const source = await fs.readFile(file, { encoding: "utf8" });
  const code = String(
    await compile(source, {
      outputFormat: "function-body",
      remarkPlugins: [
        gfm,
        withToc,
        withTocExport,
        remarkBreaks,
        remarkFrontmatter,
      ],
      rehypePlugins: [rehypeSlug, rehypeGithubAlerts],
    }),
  );

  const { default: MDXContent, tableOfContents } = await run(code, {
    ...runtime,
    baseUrl: import.meta.url,
  });

  return (
    <div className="flex flex-col md:flex-row">
      <div className="prose z-10 prose-ul:my-0 prose-li:my-0 md:sticky md:top-24 md:max-h-dvh md:overflow-y-scroll">
        <TableOfContents
          tableOfContents={tableOfContents as Toc}
          maxDepth={3}
          slugger={new Slugger()}
        />
      </div>
      <div className="mx-auto w-full max-w-screen-lg rounded bg-white px-4 py-6 shadow md:px-12">
        <div className="fixed left-0 right-0 top-1/2 -rotate-45 text-center text-2xl font-light text-red-900 opacity-15">
          <p>{t("warning")}</p>
          <p className="text-sm">&copy; {t("copyright")}</p>
        </div>
        <article className="prose prose-p:my-2">
          <MDXContent />
        </article>
      </div>
    </div>
  );
};

export default PostPage;
