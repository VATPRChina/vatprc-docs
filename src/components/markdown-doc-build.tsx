import { compile, run, runSync } from "@mdx-js/mdx";
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

type ExecutedMDX = Awaited<ReturnType<typeof run>> & {
  tableOfContents: Toc;
  frontmatter: Record<string, unknown>;
};

const postprocess = (mdx: ExecutedMDX) => {
  const { default: MDXContent, tableOfContents, frontmatter } = mdx;

  const frontmatterTitle = typeof frontmatter?.title === "string" ? frontmatter?.title : undefined;
  const title = frontmatterTitle ?? tableOfContents?.[0]?.value;

  return { MDXContent, tableOfContents: tableOfContents, title, frontmatter };
};

export const buildMarkdownDoc = async (source: string) => {
  const code = await compileMarkdownDoc(source);

  const mdx = (await run(code, { ...runtime, baseUrl: import.meta.url })) as ExecutedMDX;

  return postprocess(mdx);
};

export const buildMarkdownDocSync = (compiled: string) => {
  const mdx = runSync(compiled, { ...runtime, baseUrl: import.meta.url }) as ExecutedMDX;
  return postprocess(mdx);
};
