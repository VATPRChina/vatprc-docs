import { parseAnnouncements } from "./news";
import { expect, test } from "vitest";

const raw = {
  topic_list: {
    topics: [
      { id: 1, title: "老置顶", created_at: "2013-04-28T00:00:00.000Z", pinned: true, slug: "old-pinned" },
      { id: 2, title: "公告 B", created_at: "2026-05-03T00:00:00.000Z", pinned: false, slug: "notice-b" },
      { id: 3, title: "公告 A", created_at: "2026-07-12T00:00:00.000Z", pinned: false, slug: "notice-a" },
    ],
  },
};

test("filters pinned topics and sorts by created_at desc", () => {
  const result = parseAnnouncements(raw);
  expect(result.map((a) => a.id)).toEqual([3, 2]);
});

test("builds forum topic urls from slug and id", () => {
  const result = parseAnnouncements(raw);
  expect(result[0].url).toBe("https://community.vatprc.net/t/notice-a/3");
});

test("limits the number of results", () => {
  expect(parseAnnouncements(raw, 1)).toHaveLength(1);
});

test("returns empty list for malformed payload", () => {
  expect(parseAnnouncements({} as never)).toEqual([]);
});
