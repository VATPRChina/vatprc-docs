import { run, runSync } from "@mdx-js/mdx";
import { Toc } from "@stefanprobst/remark-extract-toc";
import * as runtime from "react/jsx-runtime";

type ExecutedMDX = Awaited<ReturnType<typeof run>> & {
  tableOfContents: Toc;
  frontmatter: Record<string, unknown>;
  title: string;
};
const postprocess = (mdx: ExecutedMDX) => {
  const { default: MDXContent, tableOfContents, frontmatter } = mdx;

  const frontmatterTitle = typeof frontmatter?.title === "string" ? frontmatter?.title : undefined;
  const title = frontmatterTitle ?? tableOfContents?.[0]?.value;

  return { MDXContent, tableOfContents: tableOfContents, title, frontmatter };
};

export const buildMarkdownDoc = async (compiled: string) => {
  const mdx = (await run(compiled, { ...runtime, baseUrl: import.meta.url })) as ExecutedMDX;

  return postprocess(mdx);
};

export const buildMarkdownDocSync = (compiled: string) => {
  const mdx = runSync(compiled, { ...runtime, baseUrl: import.meta.url }) as ExecutedMDX;
  return postprocess(mdx);
};
