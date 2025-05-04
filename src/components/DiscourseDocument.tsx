"use client";

import { compile, run } from "@mdx-js/mdx";
import withToc, { Toc, TocEntry } from "@stefanprobst/remark-extract-toc";
import withTocExport from "@stefanprobst/remark-extract-toc/mdx";
import Slugger from "github-slugger";
import { useLocale } from "next-intl";
import React from "react";
import * as runtime from "react/jsx-runtime";
import rehypeExternalLinks from "rehype-external-links";
import { rehypeGithubAlerts } from "rehype-github-alerts";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkFrontmatter from "remark-frontmatter";
import gfm from "remark-gfm";
import useSWR from "swr";

interface PostMeta {
  title: string;
  thumbnails?: {
    url?: string;
  }[];
}

interface PageRelatedPostItem {
  postId: string;
}

interface PageItem {
  post: Record<string, PageRelatedPostItem>;
}

export const PAGE_MAP: Record<string, PageItem | undefined> = {
  introduction: {
    post: { "zh-cn": { postId: "7166" }, en: { postId: "7204" } },
  },
  loa: { post: { all: { postId: "7217" } } },
  ts3: { post: { "zh-cn": { postId: "7164" }, en: { postId: "7212" } } },
  fir: { post: { "zh-cn": { postId: "7170" }, en: { postId: "7207" } } },
  rvsm: { post: { "zh-cn": { postId: "7182" }, en: { postId: "7208" } } },
  vfr: { post: { "zh-cn": { postId: "7183" }, en: { postId: "7209" } } },
  "start-to-fly": {
    post: { "zh-cn": { postId: "7185" }, en: { postId: "7211" } },
  },
  "introduction-to-fly": {
    post: { "zh-cn": { postId: "7186" }, en: { postId: "7210" } },
  },
  "controller-regulations": {
    post: { "zh-cn": { postId: "7187" }, en: { postId: "7213" } },
  },
  "become-a-controller": {
    post: { "zh-cn": { postId: "7188" }, en: { postId: "7214" } },
  },
  "visiting-and-transferring": {
    post: { "zh-cn": { postId: "7189" }, en: { postId: "7215" } },
  },
  staff: { post: { "zh-cn": { postId: "7190" }, en: { postId: "7205" } } },
  privacy: { post: { "zh-cn": { postId: "7191" }, en: { postId: "7206" } } },
  sop: { post: { "zh-cn": { postId: "7532" } } },
  "controller-list": { post: { all: { postId: "" } } },
  sector: { post: { all: { postId: "8652" } } },
  "atc-positions-frequencies": { post: { all: { postId: "8884" } } },
  "pilot-softwares": { post: { all: { postId: "9143" } } },
};

const addIdToToc = (toc: TocEntry, slugger: Slugger) => {
  toc.id = slugger.slug(toc.value);
  for (const entry of toc.children ?? []) {
    addIdToToc(entry, slugger);
  }
};

const fetcher = async ([, postId]: [string, string]) => {
  const postPath = `${postId}/1`;
  const meta: PostMeta = await fetch(
    `https://community.vatprc.net/t/topic/${postPath}.json`,
  ).then((res) => res.json());
  const raw = await fetch(`https://community.vatprc.net/raw/${postPath}`).then(
    (res) => res.text(),
  );

  let contentRes = raw;
  let i = 0;
  contentRes = contentRes.replaceAll(/upload:\/\/([\w.-]+)/g, () => {
    const thumbnailUrl = meta.thumbnails?.[i]?.url ?? "";
    i++;
    return thumbnailUrl;
  });

  const code = String(
    await compile(contentRes, {
      outputFormat: "function-body",
      remarkPlugins: [
        gfm,
        withToc,
        withTocExport,
        remarkBreaks,
        remarkFrontmatter,
      ],
      rehypePlugins: [
        rehypeSlug,
        rehypeGithubAlerts,
        [rehypeExternalLinks, { target: "_blank", rel: "noopener noreferrer" }],
      ],
    }),
  );

  const { default: MDXContent, tableOfContents } = await run(code, {
    ...runtime,
    baseUrl: import.meta.url,
  });

  const slugger = new Slugger();
  for (const toc of tableOfContents as Toc) {
    addIdToToc(toc, slugger);
  }

  return { MDXContent, tableOfContents: tableOfContents as Toc };
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
          <a href={`#${toc.id}`} className="font-normal no-underline">
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

export const DiscourseDocument: React.FC<{
  pageName: string;
}> = ({ pageName }) => {
  const locale = useLocale();

  const pageItem = PAGE_MAP[pageName];
  const postItem = pageItem?.post.all ?? pageItem?.post[locale];
  const postId = postItem?.postId;
  const { data, isLoading } = useSWR(
    [`https://community.vatprc.net/t/topic/${postId}.json`, postId],
    fetcher,
  );
  if (isLoading || !data) return "Loading...";
  return (
    <div className="flex flex-col md:flex-row">
      <div className="prose z-10 dark:prose-invert prose-ul:my-0 prose-li:my-0 md:sticky md:top-24 md:max-h-dvh md:overflow-y-scroll">
        <TableOfContents
          tableOfContents={data.tableOfContents as Toc}
          maxDepth={3}
          slugger={new Slugger()}
        />
      </div>
      <div className="mx-auto w-full max-w-screen-lg rounded bg-white px-4 py-6 shadow dark:bg-black dark:shadow-none md:px-12">
        <article className="prose dark:prose-invert prose-p:my-2">
          <data.MDXContent />
        </article>
      </div>
    </div>
  );
};
