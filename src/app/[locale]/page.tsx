import { compile, run } from "@mdx-js/mdx";
import withToc, { Toc } from "@stefanprobst/remark-extract-toc";
import withTocExport from "@stefanprobst/remark-extract-toc/mdx";
import fs from "fs/promises";
import { glob } from "glob";
import Link from "next/link";
import path from "path";
import * as runtime from "react/jsx-runtime";
import remarkFrontmatter from "remark-frontmatter";
import gfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

const HomePage = async () => {
  const files = await glob("docs/**/*.md");
  return (
    <div className="flex flex-row flex-wrap gap-8">
      {files.sort().map(async (file) => {
        const source = await fs.readFile(file, { encoding: "utf8" });
        const compiled = await compile(source, {
          outputFormat: "function-body",
          remarkPlugins: [
            gfm,
            withToc,
            withTocExport,
            remarkFrontmatter,
            remarkMdxFrontmatter,
          ],
        });
        const code = String(compiled);

        const { tableOfContents, frontmatter } = await run(code, {
          ...runtime,
          baseUrl: import.meta.url,
        });

        const title =
          (frontmatter as { title?: string })?.title ??
          (tableOfContents as Toc)?.[0]?.value ??
          path.basename(file, ".md");
        return (
          <Link href={file.replace(".md", "")} key={file}>
            <div className="flex w-96 flex-col gap-2 rounded-md bg-white p-2 shadow-md">
              <span>{title}</span>
              <span className="text-slate-500">
                {path.basename(file, ".md")}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default HomePage;
