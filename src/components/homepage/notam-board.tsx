import { getAnnouncements } from "@/lib/news";
import { cn } from "@/lib/utils";
import { Trans } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import React from "react";

const METAR_STATIONS = ["ZBAA", "ZSPD"];

const useMetar = (icao: string) =>
  useQuery({
    queryKey: ["metar", icao],
    queryFn: async () => {
      const res = await fetch(`${import.meta.env.VITE_API_ENDPOINT}/api/compat/euroscope/metar/${icao}`);
      if (!res.ok) throw new Error(`metar ${icao}: ${res.status}`);
      return res.text();
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

const MetarLine: React.FC<{ icao: string }> = ({ icao }) => {
  const { data } = useMetar(icao);
  if (!data) return null;
  return <p className="truncate font-mono text-xs text-gray-500">{data}</p>;
};

export const NotamBoard: React.FC<{ className?: string }> = ({ className }) => {
  const { data: announcements } = useQuery({
    queryKey: ["forum-announcements"],
    queryFn: () => getAnnouncements(),
    staleTime: 5 * 60 * 1000,
  });

  if (!announcements || announcements.length === 0) return null;

  return (
    <section className={cn("w-full", className)}>
      <h3 className="mb-4 text-2xl font-medium">
        <Trans>NOTAM · Announcements</Trans>
      </h3>
      <div className="border border-gray-200 dark:border-gray-800">
        {announcements.map((a, i) => (
          <a
            key={a.id}
            href={a.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-baseline gap-4 border-b border-gray-200 px-4 py-3 last:border-b-0 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-900"
          >
            <span className="text-vatprc font-mono text-sm">A{String(i + 1).padStart(4, "0")}</span>
            <span className="font-mono text-xs text-gray-500">{format(parseISO(a.createdAt), "yyyy-MM-dd")}</span>
            <span className="flex-1 truncate text-sm">{a.title}</span>
          </a>
        ))}
      </div>
      <div className="mt-2 space-y-0.5">
        {METAR_STATIONS.map((icao) => (
          <MetarLine key={icao} icao={icao} />
        ))}
      </div>
    </section>
  );
};
