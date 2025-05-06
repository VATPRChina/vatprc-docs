"use client";

import { fetcher } from "./DiscourseDocument.server";
import { MarkdownDoc } from "./MarkdownDoc";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertCircle, Loader } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import React from "react";
import useSWR from "swr";

export const DiscourseDocument: React.FC<{
  cn?: string;
  en: string;
}> = ({ cn, en }) => {
  const locale = useLocale();
  const t = useTranslations("Components.DiscourseDocument");

  const postId = locale === "zh-cn" ? (cn ?? en) : en;
  const { data, isLoading, error } = useSWR(
    [`https://community.vatprc.net/t/topic/${postId}.json`, postId],
    fetcher,
  );
  if (isLoading) {
    return (
      <div className="flex h-96">
        <Loader className="m-auto h-24 animate-spin" size={48} />
      </div>
    );
  }
  if (error || !data) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{t("Error")}</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }
  return (
    <MarkdownDoc toc={data.tableOfContents}>
      <h1 className="text-2xl">{data.title}</h1>
      {<data.MDXContent />}
    </MarkdownDoc>
  );
};
