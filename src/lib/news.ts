import { createServerFn } from "@tanstack/react-start";

export interface Announcement {
  id: number;
  title: string;
  url: string;
  createdAt: string;
}

interface DiscourseTopic {
  id: number;
  title: string;
  created_at: string;
  pinned: boolean;
  slug: string;
}

export interface DiscourseCategoryResponse {
  topic_list?: { topics?: DiscourseTopic[] };
}

const FORUM_BASE = "https://community.vatprc.net";
const ANNOUNCEMENT_CATEGORY_JSON = `${FORUM_BASE}/c/69-category/12-category/12.json`;

export const parseAnnouncements = (raw: DiscourseCategoryResponse, limit = 5): Announcement[] =>
  (raw.topic_list?.topics ?? [])
    .filter((t) => !t.pinned)
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, limit)
    .map((t) => ({
      id: t.id,
      title: t.title,
      url: `${FORUM_BASE}/t/${t.slug}/${t.id}`,
      createdAt: t.created_at,
    }));

let cache: { at: number; data: Announcement[] } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

export const getAnnouncements = createServerFn().handler(async (): Promise<Announcement[]> => {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.data;
  try {
    const res = await fetch(ANNOUNCEMENT_CATEGORY_JSON, { headers: { accept: "application/json" } });
    if (!res.ok) return cache?.data ?? [];
    const data = parseAnnouncements((await res.json()) as DiscourseCategoryResponse);
    cache = { at: Date.now(), data };
    return data;
  } catch {
    return cache?.data ?? [];
  }
});
