import { buildMarkdownDoc, MarkdownDoc } from "@/components/MarkdownDoc";
import { PageProps } from "@/utils";
import fs from "fs/promises";
import { glob } from "glob";
import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import React from "react";

export const generateStaticParams = async () => {
  const pages = (await glob("docs/**/*.md")).map((file) =>
    file.replace(".md", "").split("/").slice(1),
  );
  return pages.map((slug) => ({ slug }));
};

export const generateMetadata = async ({
  params,
}: PageProps<"locale" | "...slug">): Promise<Metadata> => {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  const file = `docs/${slug.join("/")}.md`;
  const source = await fs.readFile(file, { encoding: "utf8" });
  const meta = await buildMarkdownDoc(source);
  return { title: `${meta.title} - ${t("Legacy.title")}` };
};

const PostPage = async (props: PageProps<"locale" | "...slug">) => {
  const { slug, locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations("Docs.Single");

  const file = `docs/${slug.join("/")}.md`;

  const source = await fs.readFile(file, { encoding: "utf8" });
  const data = await buildMarkdownDoc(source);

  return (
    <MarkdownDoc toc={data.tableOfContents}>
      <div className="fixed left-0 right-0 top-1/2 -rotate-45 text-center text-2xl font-light text-red-900 opacity-15 dark:text-red-50 dark:opacity-20">
        <p>{t("warning")}</p>
        <p className="text-sm">&copy; {t("copyright")}</p>
      </div>
      <data.MDXContent />
    </MarkdownDoc>
  );
};

export default PostPage;
