import fs from "fs/promises";
import gfm from "remark-gfm";
import withToc from "@stefanprobst/remark-extract-toc";
import withTocExport from "@stefanprobst/remark-extract-toc/mdx";
import { compile, run } from "@mdx-js/mdx";
import * as runtime from "react/jsx-runtime";
import { glob } from "glob";
import rehypeSlug from "rehype-slug";
import Slugger from "github-slugger";
import { rehypeGithubAlerts } from "rehype-github-alerts";
import React from "react";
import remarkBreaks from "remark-breaks";
import remarkFrontmatter from "remark-frontmatter";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageProps } from "@/utils";

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
    })
  );

  const { default: MDXContent, tableOfContents } = await run(code, {
    ...runtime,
    baseUrl: import.meta.url,
  });

  return (
    <div className="flex flex-col md:flex-row">
      <div className="prose md:sticky md:top-24 md:overflow-y-scroll md:max-h-dvh z-10 prose-ul:my-0 prose-li:my-0">
        <TableOfContents
          tableOfContents={tableOfContents}
          maxDepth={3}
          slugger={new Slugger()}
        />
      </div>
      <div className="bg-white px-4 md:px-12 py-6 mx-auto shadow rounded">
        <div className="fixed top-1/2 left-0 right-0 font-light text-center text-2xl text-red-900 opacity-15 -rotate-45">
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
