import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { $api } from "@/lib/client";
import { Trans } from "@lingui/react/macro";
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
      <div className="flex w-full max-w-3xl flex-row items-end gap-2">
        <label className="grid gap-2">
          <span>
            <Trans>Picture</Trans>
          </span>
          <Input
            id="picture"
            type="file"
            accept="image/*"
            onChange={(event) => onSelectFile(event.currentTarget.files?.[0] ?? null)}
          />
        </label>
        <Button onClick={onUpload} variant="neutral" disabled={isPending} aria-busy={isPending}>
          <Trans>Upload</Trans>
        </Button>
      </div>
      <p>URL: {data?.url}</p>
      <p>Error: {error?.title}</p>
    </div>
  );
}
