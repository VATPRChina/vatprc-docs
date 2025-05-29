import { Anchor, Box, Grid, Stack, TypographyStylesProvider } from "@mantine/core";
import { compile, run } from "@mdx-js/mdx";
import withToc, { Toc, TocEntry } from "@stefanprobst/remark-extract-toc";
import withTocExport from "@stefanprobst/remark-extract-toc/mdx";
import Slugger from "github-slugger";
import React from "react";
import * as runtime from "react/jsx-runtime";
import rehypeExternalLinks from "rehype-external-links";
import { rehypeGithubAlerts } from "rehype-github-alerts";
import rehypeSlug from "rehype-slug";
import remarkBreaks from "remark-breaks";
import remarkFrontmatter from "remark-frontmatter";
import gfm from "remark-gfm";
import remarkMdxFrontmatter from "remark-mdx-frontmatter";

const addIdToTocEntry = (toc: TocEntry, slugger: Slugger) => {
  toc.id = slugger.slug(toc.value);
  for (const entry of toc.children ?? []) {
    addIdToTocEntry(entry, slugger);
  }
};

export const addIdToToc = (tableOfContents: Toc) => {
  const slugger = new Slugger();
  for (const toc of tableOfContents) {
    addIdToTocEntry(toc, slugger);
  }
};

export const TableOfContents = ({ tableOfContents, maxDepth }: { tableOfContents: Toc; maxDepth?: number }) => {
  if (!maxDepth || maxDepth <= 0) {
    return null;
  }

  return tableOfContents.map((toc) => (
    <Box key={toc.value} role="listitem" pl="2ch">
      <Anchor c="dark" underline="hover" href={`#${toc.id}`}>
        {toc.value}
      </Anchor>

      {toc.children && (
        <Stack
          gap="xs"
          ml={16}
          my={8}
          style={{
            borderLeft: "1px solid var(--mantine-color-gray-3)",
          }}
          role="list"
        >
          {toc.children.map((child) => (
            <TableOfContents key={child.value} tableOfContents={[child]} maxDepth={maxDepth - 1} />
          ))}
        </Stack>
      )}
    </Box>
  ));
};

export const buildMarkdownDoc = async (source: string) => {
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

  return { MDXContent, tableOfContents: tableOfContents, title };
};

export const MarkdownDoc: React.FC<{
  children: React.ReactNode;
  toc: Toc;
}> = ({ children, toc }) => {
  return (
    <Grid>
      <Grid.Col span={8}>
        <TypographyStylesProvider>{children}</TypographyStylesProvider>
      </Grid.Col>
      <Grid.Col span={4}>
        <Box
          style={{
            position: "sticky",
            top: "calc(var(--app-shell-header-offset, 0rem) + var(--app-shell-padding) + var(--grid-col-padding) + 1em)",
          }}
        >
          <TableOfContents tableOfContents={toc} maxDepth={3} />
        </Box>
      </Grid.Col>
    </Grid>
  );
};
