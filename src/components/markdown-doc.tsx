import { TableOfContents } from "@mantine/core";
import type React from "react";

export const MarkdownDoc: React.FC<{
  children: React.ReactNode;
  tocHeader?: React.ReactNode;
}> = ({ children, tocHeader }) => {
  return (
    <div className="container mx-auto flex flex-col md:flex-row">
      <div className="px-4 py-6 md:flex-2/3 md:px-12">
        <article className="prose dark:prose-invert vatprc-prose mx-auto" id="markdown-doc">
          {children}
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
