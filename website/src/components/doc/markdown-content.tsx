import type { CompiledMarkdownDoc } from "./markdown-doc-compile";
import { highlightMarkdownCode } from "./markdown-highlighter";
import { Markdown } from "@tanstack/markdown/react";
import { ClientOnly } from "@tanstack/react-router";
import React, { lazy, Suspense } from "react";

const GeojsonMap = lazy(() => import("./geojson-map"));

const GeojsonBlock: React.FC<React.PropsWithChildren<{ collection: string }>> = ({ collection }) => {
  return (
    <div>
      <ClientOnly>
        <Suspense fallback={null}>
          <GeojsonMap key={collection} collection={collection} />
        </Suspense>
      </ClientOnly>
    </div>
  );
};

const ExternalLink: React.FC<React.ComponentProps<"a">> = ({ href, ...props }) => (
  <a
    {...props}
    href={href}
    {...(href && /^(https?:)?\/\//i.test(href) && { target: "_blank", rel: "noopener noreferrer" })}
  />
);

const components = { "geojson-map": GeojsonBlock, a: ExternalLink };

export const MarkdownContent: React.FC<Pick<CompiledMarkdownDoc, "markdown">> = ({ markdown }) => (
  <Markdown components={components} highlighter={highlightMarkdownCode} codeLineNumbers allowHtml>
    {markdown}
  </Markdown>
);
