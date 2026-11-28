import { createHighlighter } from "@tanstack/highlight/core";
import { html } from "@tanstack/highlight/languages/html";
import { js } from "@tanstack/highlight/languages/js";
import { json } from "@tanstack/highlight/languages/json";
import { plaintext } from "@tanstack/highlight/languages/plaintext";
import { shell } from "@tanstack/highlight/languages/shell";
import { ts } from "@tanstack/highlight/languages/ts";
import { tsx } from "@tanstack/highlight/languages/tsx";
import { yaml } from "@tanstack/highlight/languages/yaml";
import { createTanStackMarkdownHighlighter } from "@tanstack/highlight/markdown";
import { createThemeCss } from "@tanstack/highlight/theme";
import { githubDarkTheme } from "@tanstack/highlight/themes/github-dark";
import { githubLightTheme } from "@tanstack/highlight/themes/github-light";

export const highlightMarkdownCode = createTanStackMarkdownHighlighter(
  createHighlighter({
    languages: [plaintext, html, js, ts, tsx, shell, yaml, { ...json, aliases: [...(json.aliases ?? []), "geojson"] }],
  }),
);

export const HIGHLIGHT_CSS = createThemeCss({
  light: githubLightTheme,
  dark: githubDarkTheme,
  lightSelector: ".vatprc-prose",
  darkSelector: '[data-mantine-color-scheme="dark"] .vatprc-prose',
  codeBlockSelector: ".vatprc-prose pre.tm-code",
  lineNumbersSelector: ".vatprc-prose .tm-code--line-numbers",
});
