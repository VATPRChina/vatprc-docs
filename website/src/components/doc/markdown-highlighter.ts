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

export const highlightMarkdownCode = createTanStackMarkdownHighlighter(
  createHighlighter({
    languages: [plaintext, html, js, ts, tsx, shell, yaml, { ...json, aliases: [...(json.aliases ?? []), "geojson"] }],
  }),
);
