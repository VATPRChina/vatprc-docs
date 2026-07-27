import { COMMUNITY_ENDPOINT } from "@/lib/client";
import { cn } from "@/lib/utils";
import { Trans } from "@lingui/react/macro";
import { Skeleton } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import React from "react";

interface DiscourseCategoryResponse {
  topic_list?: {
    topics?: {
      id: number;
      title: string;
      created_at: string;
      pinned: boolean;
      slug: string;
    }[];
  };
}

const ANNOUNCEMENT_CATEGORY_JSON = `${COMMUNITY_ENDPOINT}/c/69-category/12-category/12.json`;

export const NotamBoard: React.FC<{ className?: string }> = ({ className }) => {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["forum-announcements"],
    queryFn: async () => {
      const response = await fetch(ANNOUNCEMENT_CATEGORY_JSON, {
        headers: { accept: "application/json" },
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) throw new Error(`Failed to load announcements: ${response.status}`);

      const raw = (await response.json()) as DiscourseCategoryResponse;
      return (raw.topic_list?.topics ?? [])
        .filter((topic) => !topic.pinned)
        .sort((a, b) => b.created_at.localeCompare(a.created_at))
        .slice(0, 3)
        .map((topic) => ({
          id: topic.id,
          title: topic.title,
          url: `${COMMUNITY_ENDPOINT}/t/${topic.slug}/${topic.id}`,
          createdAt: topic.created_at,
        }));
    },
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className={cn("w-full", className)}>
      <h2 className="mb-4 text-2xl font-medium">
        <Trans>NOTAM · Announcements</Trans>
      </h2>
      <div className="border border-black/15 dark:border-white/20">
        {isLoading && (
          <>
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="border-b border-black/15 px-4 py-3 last:border-b-0 dark:border-white/20">
                  <Skeleton width="100%" height={24} />
                </div>
              ))}
          </>
        )}
        {announcements?.length === 0 && (
          <p>
            <Trans>There is no NOTAMs / announcements.</Trans>
          </p>
        )}
        {announcements?.map((a) => (
          <a
            key={a.id}
            href={a.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-baseline gap-4 border-b border-black/15 px-4 py-3 last:border-b-0 hover:bg-gray-50 dark:border-white/20 dark:hover:bg-gray-900"
          >
            <span className="font-mono text-sm text-gray-600 dark:text-gray-300">
              {format(parseISO(a.createdAt), "yyyy-MM-dd")}
            </span>
            <span className="flex-1 truncate text-base">{a.title}</span>
          </a>
        ))}
      </div>
    </section>
  );
};
