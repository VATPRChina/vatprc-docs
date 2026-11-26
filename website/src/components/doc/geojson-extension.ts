import { parseGeojson } from "./geojson";
import { mapBlocks } from "./markdown-blocks";
import type { MarkdownExtension } from "@tanstack/markdown";

export const geojsonExtension = (): MarkdownExtension => ({
  name: "geojson",
  transformDocument(document) {
    return {
      ...document,
      children: mapBlocks(document.children, (node) => {
        if (node.type !== "code" || node.lang !== "geojson") return node;
        const data = parseGeojson(node.value);
        if (!data) return node;
        return {
          type: "component",
          name: "GeoJSON",
          tagName: "geojson-map",
          attributes: {},
          properties: { collection: JSON.stringify(data) },
          children: [node],
        };
      }),
    };
  },
});
