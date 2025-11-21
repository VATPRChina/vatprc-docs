import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
import { Button, FileInput } from "@mantine/core";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/docs/utils/image")({
  component: RouteComponent,
});

function RouteComponent() {
  const { mutate, data, error, isPending } = $api.useMutation("post", "/api/storage/images");

  const [file, setFile] = useState<File | null>(null);
  const onSelectFile = (e: File | null) => {
    setFile(e);
  };
  const onUpload = () => {
    if (!file) return;
    const form = new FormData();
    form.append("image", file, file?.name ?? "untitled");
    mutate({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      body: form as any,
    });
  };

  return (
    <div className="container mx-auto flex flex-col items-start gap-4">
      <h1 className="text-3xl">
        <Trans>Upload image</Trans>
      </h1>
      <div className="flex w-full max-w-3xl flex-row items-end gap-4">
        <FileInput id="picture" onChange={onSelectFile} label="Picture" />
        <Button onClick={onUpload} variant="secondary" loading={isPending}>
          <Trans>Upload</Trans>
        </Button>
      </div>
      <p>URL: {data?.url}</p>
      <p>Error: {error?.message}</p>
    </div>
  );
}
