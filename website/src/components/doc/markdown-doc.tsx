import { TableOfContents } from "@mantine/core";
import { createThemeCss } from "@tanstack/highlight/theme";
import { githubDarkTheme } from "@tanstack/highlight/themes/github-dark";
import { githubLightTheme } from "@tanstack/highlight/themes/github-light";
import type React from "react";

const highlightCss = createThemeCss({
  light: githubLightTheme,
  dark: githubDarkTheme,
  lightSelector: ".vatprc-prose",
  darkSelector: '[data-mantine-color-scheme="dark"] .vatprc-prose',
  codeBlockSelector: ".vatprc-prose pre.tm-code",
  lineNumbersSelector: ".vatprc-prose .tm-code--line-numbers",
});

export const MarkdownDoc: React.FC<{
  children: React.ReactNode;
  tocHeader?: React.ReactNode;
  inline?: boolean;
}> = ({ children, tocHeader, inline }) => {
  const content = (
    <>
      <style href="markdown-highlight-theme" precedence="markdown">
        {highlightCss}
      </style>
      {children}
    </>
  );
  if (inline) {
    return <article className="prose dark:prose-invert vatprc-prose">{content}</article>;
  }

  return (
    <div className="container mx-auto flex flex-col md:flex-row">
      <div className="px-4 py-6 md:flex-2/3 md:px-12">
        <article className="prose dark:prose-invert vatprc-prose mx-auto" id="markdown-doc">
          {content}
        </article>
      </div>
      <div className="z-10 md:sticky md:top-24 md:max-h-dvh md:flex-1/3 md:overflow-y-scroll">
        {tocHeader}
        <TableOfContents
          variant="light"
          scrollSpyOptions={{
            selector: "#markdown-doc :is(h1, h2, h3, h4, h5, h6)",
            offset: 54,
          }}
          getControlProps={({ data }) => ({
            component: "a",
            href: data.getNode().getAttribute("id") && "#" + data.getNode().getAttribute("id"),
            children: data.value,
          })}
        />
      </div>
    </div>
  );
};
