import { FC } from "react";

export const FixLabel: FC<{ fix: string | null }> = ({ fix }) => {
  if (!fix) return <span>—</span>;

  return <span className="font-mono">{fix}</span>;
};

export const FixPair: FC<{ from: string | null; to: string | null }> = ({ from, to }) => {
  return (
    <div className="space-x-1">
      <FixLabel fix={from} />
      <span>→</span>
      <FixLabel fix={to} />
    </div>
  );
};
