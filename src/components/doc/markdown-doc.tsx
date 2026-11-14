import { Trans } from "@lingui/react/macro";
import { useEffect, useRef, useState, type ReactNode } from "react";

export function MarkdownDoc({
  children,
  tocHeader,
  inline,
}: {
  children: ReactNode;
  tocHeader?: ReactNode;
  inline?: boolean;
}) {
  const article = useRef<HTMLElement>(null);
  const [headings, setHeadings] = useState<{ id: string; title: string; level: number }[]>([]);
  useEffect(() => {
    setHeadings(
      Array.from(
        article.current?.querySelectorAll<HTMLHeadingElement>("h1[id],h2[id],h3[id],h4[id],h5[id],h6[id]") ?? [],
      ).map((heading) => ({
        id: heading.id,
        title: heading.textContent ?? "",
        level: Number(heading.tagName.slice(1)),
      })),
    );
  }, [children]);
  if (inline) return <article className="prose dark:prose-invert vatprc-prose">{children}</article>;
  return (
    <div className="container mx-auto flex flex-col md:flex-row">
      <div className="min-w-0 px-4 py-6 md:flex-2/3 md:px-12">
        <article ref={article} className="prose dark:prose-invert vatprc-prose mx-auto" id="markdown-doc">
          {children}
        </article>
      </div>
      <aside className="z-10 md:sticky md:top-24 md:max-h-[80dvh] md:flex-1/3 md:self-start md:overflow-y-auto">
        {tocHeader}
        <nav aria-label="Table of contents" className="grid gap-2 p-4">
          <h2 className="font-heading">
            <Trans>Table of contents</Trans>
          </h2>
          {headings.map((heading) => (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              style={{ paddingInlineStart: `${(heading.level - 1) * 12}px` }}
              className="text-sm hover:underline"
            >
              {heading.title}
            </a>
          ))}
        </nav>
      </aside>
    </div>
  );
}
