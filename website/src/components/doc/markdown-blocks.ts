import type { BlockNode } from "@tanstack/markdown";

// TanStack stores list items and footnotes separately from ordinary block children.
export const mapBlocks = (blocks: BlockNode[], transform: (block: BlockNode) => BlockNode): BlockNode[] =>
  blocks.map((block) => {
    switch (block.type) {
      case "list":
        return transform({
          ...block,
          items: block.items.map((item) => ({ ...item, children: mapBlocks(item.children, transform) })),
        });
      case "footnotes":
        return transform({
          ...block,
          items: block.items.map((item) => ({ ...item, children: mapBlocks(item.children, transform) })),
        });
      case "blockquote":
      case "callout":
      case "component":
        return transform({ ...block, children: mapBlocks(block.children, transform) });
      default:
        return transform(block);
    }
  });
