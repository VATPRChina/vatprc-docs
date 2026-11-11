import clsx from "clsx";
import type { ComponentProps } from "react";

// Semantic HTML keeps TanStack's dynamic row model and custom header controls intact.
export function Table({
  className,
  highlightOnHover,
  striped,
  withTableBorder,
  withColumnBorders,
  layout,
  ...props
}: ComponentProps<"table"> & {
  highlightOnHover?: boolean;
  striped?: boolean;
  withTableBorder?: boolean;
  withColumnBorders?: boolean;
  layout?: React.CSSProperties["tableLayout"];
}) {
  return (
    <table
      {...props}
      style={{ tableLayout: layout, ...props.style }}
      className={clsx(
        "[&_thead]:border-separator [&_thead]:text-muted w-full border-collapse text-left text-sm [&_td]:px-3 [&_td]:py-2 [&_th]:px-3 [&_th]:py-2 [&_th]:font-medium [&_thead]:border-b",
        highlightOnHover && "[&_tbody_tr:hover]:bg-default",
        striped && "[&_tbody_tr:nth-child(even)]:bg-default/50",
        withTableBorder && "border-separator border",
        withColumnBorders && "[&_td]:border-separator [&_td]:border-x",
        className,
      )}
    />
  );
}
Table.Thead = function TableThead(props: ComponentProps<"thead">) {
  return <thead {...props} />;
};
Table.Tbody = function TableTbody(props: ComponentProps<"tbody">) {
  return <tbody {...props} />;
};
Table.Tr = function TableTr(props: ComponentProps<"tr">) {
  return <tr {...props} />;
};
Table.Th = function TableTh({ w, ...props }: ComponentProps<"th"> & { w?: number }) {
  return <th {...props} style={{ width: w, ...props.style }} />;
};
Table.Td = function TableTd(props: ComponentProps<"td">) {
  return <td {...props} />;
};
Table.ScrollContainer = function TableScrollContainer({
  children,
  minWidth,
}: {
  children?: React.ReactNode;
  minWidth?: number;
}) {
  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth }}>{children}</div>
    </div>
  );
};
