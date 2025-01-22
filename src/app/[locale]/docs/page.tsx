import { glob } from "glob";
import Link from "next/link";
import fs from "fs/promises";
import { compile, run } from "@mdx-js/mdx";
import gfm from "remark-gfm";
import withToc from "@stefanprobst/remark-extract-toc";
import withTocExport from "@stefanprobst/remark-extract-toc/mdx";
import * as runtime from "react/jsx-runtime";
import path from "path";
import remarkFrontmatter from "remark-frontmatter";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";
import { useTranslations } from "next-intl";
import { getLocale, getTranslations, setRequestLocale } from "next-intl/server";
import { PageProps } from "@/utils";

const HomePage = async ({ params }: PageProps<"locale">) => {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const files = await glob("docs/**/*.md");
  return (
    <div className="flex flex-row gap-8 flex-wrap">
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
          (frontmatter as any)?.title ??
          (tableOfContents as any)?.[0]?.value ??
          path.basename(file, ".md");
        return (
          <Link href={file.replace(".md", "")} key={file}>
            <div className="flex flex-col gap-2 w-96 p-2 bg-white shadow-md rounded-md">
              <span>{title}</span>
              <span className="text-slate-500">
                {path.basename(file, ".md")}
                {t("Layout.menu.docs")}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default HomePage;
