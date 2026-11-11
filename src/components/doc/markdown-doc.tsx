import { useEffect, useState } from "react";
import type React from "react";

export const MarkdownDoc: React.FC<{
  children: React.ReactNode;
  tocHeader?: React.ReactNode;
  inline?: boolean;
}> = ({ children, tocHeader, inline }) => {
  if (inline) {
    return <article className="prose dark:prose-invert vatprc-prose">{children}</article>;
  }

  return (
    <div className="container mx-auto flex flex-col md:flex-row">
      <div className="px-4 py-6 md:flex-2/3 md:px-12">
        <article className="prose dark:prose-invert vatprc-prose mx-auto" id="markdown-doc">
          {children}
        </article>
      </div>
      <div className="z-10 md:sticky md:top-24 md:max-h-dvh md:flex-1/3 md:overflow-y-scroll">
        {tocHeader}
        <DocumentContents />
      </div>
    </div>
  );
};

function DocumentContents() {
  const [headings, setHeadings] = useState<{ id: string; title: string; level: number }[]>([]);
  useEffect(() => {
    const article = document.getElementById("markdown-doc");
    if (!article) return;
    const update = () =>
      setHeadings(
        Array.from(article.querySelectorAll("h1, h2, h3, h4, h5, h6"))
          .filter((node) => node.id)
          .map((node) => ({ id: node.id, title: node.textContent ?? "", level: Number(node.tagName.slice(1)) })),
      );
    update();
    const observer = new MutationObserver(update);
    observer.observe(article, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, []);
  return (
    <nav aria-label="Table of contents" className="flex flex-col gap-1 p-4">
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className="text-muted hover:bg-default hover:text-foreground rounded px-2 py-1 text-sm"
          style={{ paddingLeft: `${(heading.level - 1) * 12 + 8}px` }}
        >
          {heading.title}
        </a>
      ))}
    </nav>
  );
}
