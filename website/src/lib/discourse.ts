import { COMMUNITY_ENDPOINT } from "@/lib/client";
import { createServerFn } from "@tanstack/react-start";

interface PostMeta {
  title: string;
  thumbnails?: { url?: string }[];
}

export const getDiscourseDocument = createServerFn()
  .validator((postId: string) => {
    if (typeof postId !== "string" || !/^\d+$/.test(postId)) {
      throw new Error("Invalid Discourse post ID");
    }
    return postId;
  })
  .handler(async ({ data: postId }) => {
    const postPath = `${postId}/1`;
    const [metaResponse, rawResponse] = await Promise.all([
      fetch(`${COMMUNITY_ENDPOINT}/t/topic/${postPath}.json`),
      fetch(`${COMMUNITY_ENDPOINT}/raw/${postPath}`),
    ]);
    if (!metaResponse.ok || !rawResponse.ok) {
      const failedResponse = metaResponse.ok ? rawResponse : metaResponse;
      throw new Error(`Failed to fetch Discourse post ${postId}: ${failedResponse.status}`);
    }

    const [meta, raw] = await Promise.all([metaResponse.json() as Promise<PostMeta>, rawResponse.text()]);
    let thumbnailIndex = 0;
    const source = raw.replaceAll(/upload:\/\/[\w.-]+/g, () => meta.thumbnails?.[thumbnailIndex++]?.url ?? "");
    const { compileMarkdownDoc } = await import("@/components/doc/markdown-doc-compile");
    const { html, title } = compileMarkdownDoc(source);
    return { html, title, postTitle: meta.title };
  });
