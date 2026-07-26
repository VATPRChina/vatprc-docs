import { getAnnouncements } from "@/lib/news";
import { cn } from "@/lib/utils";
import { Trans } from "@lingui/react/macro";
import { Skeleton } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import React from "react";

export const NotamBoard: React.FC<{ className?: string }> = ({ className }) => {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["forum-announcements"],
    queryFn: () => getAnnouncements(),
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
