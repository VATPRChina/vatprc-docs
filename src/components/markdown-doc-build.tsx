import { addIdToToc } from "./markdown-doc-lib";
import { compile, run } from "@mdx-js/mdx";
import withToc, { Toc } from "@stefanprobst/remark-extract-toc";
import withTocExport from "@stefanprobst/remark-extract-toc/mdx";
import * as runtime from "react/jsx-runtime";
import rehypeExternalLinks from "rehype-external-links";
import { rehypeGithubAlerts } from "rehype-github-alerts";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkFrontmatter from "remark-frontmatter";
import gfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

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
