import { Button } from "./primitives";
import { Trans, useLingui } from "@lingui/react/macro";
import { ReactNode, useRef, useState } from "react";

export type FileWithPath = File;
export const IMAGE_MIME_TYPE = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/avif"];
export function Dropzone({
  children,
  onDrop,
  accept,
  loading,
}: {
  children?: ReactNode;
  onDrop: (files: File[]) => void;
  accept?: string[];
  loading?: boolean;
}) {
  const { t } = useLingui();
  const [rejected, setRejected] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const receive = (files: File[]) => {
    const accepted = files.filter((file) => !accept || accept.includes(file.type));
    setRejected(accepted.length !== files.length);
    if (accepted.length) onDrop(accepted);
  };
  return (
    <div
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault();
        if (!loading) receive(Array.from(event.dataTransfer.files));
      }}
      className="border-separator relative flex flex-col items-center gap-2 rounded-lg border-2 border-dashed p-4"
    >
      {children}
      <input
        ref={input}
        type="file"
        className="sr-only"
        aria-label={t`Upload file`}
        accept={accept?.join(",")}
        disabled={loading}
        onChange={(event) => {
          receive(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
      <Button variant="light" disabled={loading} onClick={() => input.current?.click()}>
        <Trans>Choose file</Trans>
      </Button>
      {rejected && (
        <p role="alert" className="text-danger text-sm">
          <Trans>Unsupported file type</Trans>
        </p>
      )}
    </div>
  );
}
Dropzone.Idle = function DropzoneIdle({ children }: { children?: ReactNode }) {
  return <>{children}</>;
};
