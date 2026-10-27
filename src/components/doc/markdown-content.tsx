import type { CompiledMarkdownDoc } from "./markdown-doc-compile";
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

const GeojsonMap = lazy(() => import("./geojson-map"));

export function MarkdownContent({ document }: { document: CompiledMarkdownDoc }) {
  const ref = useRef<HTMLDivElement>(null);
  // Keep the HTML prop stable so portal state updates do not replace their target DOM.
  const markup = useMemo(() => ({ __html: document.html }), [document.html]);
  const [targets, setTargets] = useState<{ element: Element; data: GeoJSON.FeatureCollection }[]>([]);

  useEffect(() => {
    setTargets(
      document.geojson.flatMap((data, index) => {
        const element = ref.current?.querySelector(`[data-markdown-geojson="${index}"]`);
        return element ? [{ element, data }] : [];
      }),
    );
  }, [document]);

  return (
    <>
      <div ref={ref} dangerouslySetInnerHTML={markup} />
      {targets.map(({ element, data }, index) =>
        createPortal(
          <Suspense fallback={null}>
            <GeojsonMap data={data} />
          </Suspense>,
          element,
          String(index),
        ),
      )}
    </>
  );
}
