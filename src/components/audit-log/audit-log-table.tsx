import { RichTable } from "../table";
import { components } from "@/lib/api";
import { localizeWithMap } from "@/lib/i18n";
import { utc } from "@date-fns/utc";
import { MessageDescriptor } from "@lingui/core";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Code, ScrollArea, Spoiler } from "@mantine/core";
import { createColumnHelper } from "@tanstack/react-table";
import { format } from "date-fns";
import { TbAlertTriangle } from "react-icons/tb";

export const AUDIT_LOG_ENTITY_KIND = new Map<components["schemas"]["AuditLogEntityKindDto"], MessageDescriptor>([
  ["event", msg`Event`],
  ["atc-application", msg`ATC Application`],
  ["user", msg`User`],
  ["user-role", msg`User Role`],
  ["user-atc-permission", msg`User ATC Permission`],
  ["event-atc-position", msg`Event ATC Position`],
  ["event-slot", msg`Event Slot`],
]);

const formatJson = (value: unknown) => JSON.stringify(value, null, 2) ?? String(value);

const getErrorMessage = (error: unknown) => {
  if (!error) return null;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object") {
    if ("detail" in error && typeof error.detail === "string") return error.detail;
    if ("message" in error && typeof error.message === "string") return error.message;
    if ("title" in error && typeof error.title === "string") return error.title;
  }
  return null;
};

type DiffLine = {
  kind: "added" | "removed" | "unchanged";
  text: string;
};

const diffJsonByLine = (before: unknown, after: unknown): DiffLine[] => {
  const beforeLines = formatJson(before).split("\n");
  const afterLines = formatJson(after).split("\n");
  const lengths = Array.from({ length: beforeLines.length + 1 }, () => Array<number>(afterLines.length + 1).fill(0));

  for (let i = beforeLines.length - 1; i >= 0; i -= 1) {
    for (let j = afterLines.length - 1; j >= 0; j -= 1) {
      lengths[i][j] =
        beforeLines[i] === afterLines[j] ? lengths[i + 1][j + 1] + 1 : Math.max(lengths[i + 1][j], lengths[i][j + 1]);
    }
  }

  const diff: DiffLine[] = [];
  let beforeIndex = 0;
  let afterIndex = 0;

  while (beforeIndex < beforeLines.length && afterIndex < afterLines.length) {
    if (beforeLines[beforeIndex] === afterLines[afterIndex]) {
      diff.push({ kind: "unchanged", text: beforeLines[beforeIndex] });
      beforeIndex += 1;
      afterIndex += 1;
    } else if (lengths[beforeIndex + 1][afterIndex] >= lengths[beforeIndex][afterIndex + 1]) {
      diff.push({ kind: "removed", text: beforeLines[beforeIndex] });
      beforeIndex += 1;
    } else {
      diff.push({ kind: "added", text: afterLines[afterIndex] });
      afterIndex += 1;
    }
  }

  while (beforeIndex < beforeLines.length) {
    diff.push({ kind: "removed", text: beforeLines[beforeIndex] });
    beforeIndex += 1;
  }

  while (afterIndex < afterLines.length) {
    diff.push({ kind: "added", text: afterLines[afterIndex] });
    afterIndex += 1;
  }

  return diff;
};

const diffLineClassName = (kind: DiffLine["kind"]) => {
  if (kind === "added") return "bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100";
  if (kind === "removed") return "bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100";
  return "text-gray-700 dark:text-gray-300";
};

const diffLinePrefix = (kind: DiffLine["kind"]) => {
  if (kind === "added") return "+";
  if (kind === "removed") return "-";
  return " ";
};

const DiffCell = ({ before, after }: { before: unknown; after: unknown }) => (
  <Spoiler maxHeight={160} showLabel={<Trans>Show more</Trans>} hideLabel={<Trans>Show less</Trans>}>
    <ScrollArea maw={720}>
      <Code block className="min-w-max">
        {diffJsonByLine(before, after).map((line, index) => (
          <span key={index} className={`block px-1 whitespace-pre ${diffLineClassName(line.kind)}`}>
            {diffLinePrefix(line.kind)} {line.text}
          </span>
        ))}
      </Code>
    </ScrollArea>
  </Spoiler>
);

const EntityCell = ({ entity }: { entity?: null | components["schemas"]["AuditLogEntityDto"] }) => {
  const { i18n } = useLingui();

  if (!entity) return null;

  return (
    <div className="flex max-w-56 flex-col gap-1">
      <span>{localizeWithMap(AUDIT_LOG_ENTITY_KIND, entity.kind, i18n)}</span>
      <Code>{entity.id}</Code>
    </div>
  );
};

const columnHelper = createColumnHelper<components["schemas"]["AuditLogDto"]>();

const columns = [
  columnHelper.accessor("created_at", {
    header: () => <Trans>Created At</Trans>,
    cell: ({ getValue }) => format(getValue(), "yyyy-MM-dd HH:mm:ss'Z'", { in: utc }),
  }),
  columnHelper.accessor("operated_by", {
    header: () => <Trans>Operated By</Trans>,
    cell: ({ getValue }) => <Code>{getValue()}</Code>,
  }),
  columnHelper.accessor("entity", {
    header: () => <Trans>Entity</Trans>,
    cell: ({ getValue }) => <EntityCell entity={getValue()} />,
  }),
  columnHelper.accessor("child_entity", {
    header: () => <Trans>Child Entity</Trans>,
    cell: ({ getValue }) => <EntityCell entity={getValue()} />,
  }),
  columnHelper.display({
    id: "diff",
    header: () => <Trans>Diff</Trans>,
    enableSorting: false,
    cell: ({ row }) => <DiffCell before={row.original.before} after={row.original.after} />,
  }),
];

interface AuditLogTableProps {
  data?: components["schemas"]["AuditLogDto"][];
  error?: unknown;
  isLoading?: boolean;
}

export const AuditLogTable = ({ data, error, isLoading }: AuditLogTableProps) => {
  const errorMessage = getErrorMessage(error);

  if (error) {
    return (
      <Alert color="red" title={<Trans>Failed to load audit logs</Trans>} icon={<TbAlertTriangle />}>
        {errorMessage ?? <Trans>Please try again later.</Trans>}
      </Alert>
    );
  }

  return (
    <RichTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      initialState={{ sorting: [{ id: "created_at", desc: true }] }}
    />
  );
};
