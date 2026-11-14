import { BatchCreateModal } from "@/components/atc-position/batch-create-modal";
import { BatchDeleteModal } from "@/components/atc-position/batch-delete-modal";
import { POSITION_CATEGORIES, PositionModal, type PositionAction } from "@/components/atc-position/position-modal";
import { RichTable, RichTableFeatures } from "@/components/table";
import { AlertDescription, Alert, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { TabsTrigger, TabsList, TabsContent, Tabs } from "@/components/ui/tabs";
import { components } from "@/lib/api";
import { AtcPositionGroup, getAtcPositionCode, getAtcPositionGroup, supportsDcl } from "@/lib/atc-position-group";
import { $api, usePermission } from "@/lib/client";
import { loadSectorIds } from "@/lib/radar-coverage/data";
import { msg } from "@lingui/core/macro";
import { Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

type AtcPosition = components["schemas"]["AtcPositionDto"];
type AtcPositionRow = AtcPosition & { sectorId?: string };
type AtcPositionCategory = components["schemas"]["AtcPositionCategory"];
type AtcPositionFilters = {
  callsign: string;
  sectorId: string;
  category: AtcPositionCategory | null;
  callsignZh: string;
  callsignEn: string;
  frequency: string;
  cpdlc: string;
  remarks: string;
};

const ALL_POSITION_CODES = "__all__";

const EMPTY_FILTERS: AtcPositionFilters = {
  callsign: "",
  sectorId: "",
  category: null,
  callsignZh: "",
  callsignEn: "",
  frequency: "",
  cpdlc: "",
  remarks: "",
};

const columns: ColumnDef<RichTableFeatures, AtcPositionRow>[] = [
  {
    accessorKey: "callsign",
    header: () => <Trans>ATC Position</Trans>,
    cell: ({ getValue, row }) => (
      <span className="flex flex-row gap-1">
        <code className="whitespace-nowrap">{getValue<string>()}</code>
        {row.original.is_tier_2 && (
          <Badge>
            <Trans>Tier 2</Trans>
          </Badge>
        )}
        {getAtcPositionGroup(row.original.callsign) === "area" && row.original.cpdlc_code && <Badge>CPDLC</Badge>}
        {getAtcPositionGroup(row.original.callsign) === "airport" && supportsDcl(row.original.callsign) && (
          <Badge>DCL</Badge>
        )}
      </span>
    ),
  },
  {
    accessorKey: "sectorId",
    header: () => <Trans>Sector ID</Trans>,
    cell: ({ getValue }) => <code>{getValue<string | undefined>() ?? "—"}</code>,
  },
  {
    accessorKey: "category",
    header: () => <Trans>Category</Trans>,
    cell: ({ getValue }) => <CategoryLabel category={getValue<AtcPositionCategory>()} />,
    meta: { filterValues: POSITION_CATEGORIES },
  },
  {
    accessorKey: "callsign_zh",
    header: () => <Trans>Chinese Callsign</Trans>,
    cell: ({ getValue }) => getValue<string | null>() ?? "—",
  },
  {
    accessorKey: "callsign_en",
    header: () => <Trans>English Callsign</Trans>,
    cell: ({ getValue }) => getValue<string | null>() ?? "—",
  },
  {
    id: "frequency",
    accessorFn: (position) => (position.frequency_khz / 1000).toFixed(3),
    header: () => <Trans>Frequency</Trans>,
    cell: ({ getValue }) => <code>{getValue<string>()}</code>,
  },
  {
    id: "cpdlc",
    accessorKey: "cpdlc_code",
    header: () => "CPDLC",
    cell: ({ getValue }) => getValue<string | null>() ?? "—",
  },
  {
    accessorKey: "remarks",
    header: () => <Trans>Remarks</Trans>,
    cell: ({ getValue }) => getValue<string | null>() ?? "—",
  },
];

export const Route = createFileRoute("/_doc/airspace/station")({
  component: StationPage,
  head: (ctx) => ({
    meta: [{ title: ctx.match.context.i18n._(msg`ATC Positions and Frequencies`) }],
  }),
});

function CategoryLabel({ category }: { category: AtcPositionCategory }) {
  const { i18n } = useLingui();
  return i18n._(POSITION_CATEGORIES.find((item) => item.value === category)!.label);
}

function includesFilter(value: string | null | undefined, filter: string) {
  return !filter.trim() || value?.toLocaleLowerCase().includes(filter.trim().toLocaleLowerCase()) === true;
}

function matchesFilters(position: AtcPositionRow, filters: AtcPositionFilters) {
  return (
    includesFilter(position.callsign, filters.callsign) &&
    includesFilter(position.sectorId, filters.sectorId) &&
    (!filters.category || position.category === filters.category) &&
    includesFilter(position.callsign_zh, filters.callsignZh) &&
    includesFilter(position.callsign_en, filters.callsignEn) &&
    includesFilter((position.frequency_khz / 1000).toFixed(3), filters.frequency) &&
    includesFilter(position.cpdlc_code, filters.cpdlc) &&
    includesFilter(position.remarks, filters.remarks)
  );
}

export function StationPage() {
  const { t, i18n } = useLingui();
  const canManage = usePermission("tech-afv-facility-engineer");
  const [action, setAction] = useState<PositionAction | null>(null);
  const [batchCreating, setBatchCreating] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [selectedCodes, setSelectedCodes] = useState<Partial<Record<AtcPositionGroup, string>>>({});
  const [filters, setFilters] = useState<Partial<Record<AtcPositionGroup, AtcPositionFilters>>>({});
  const [deleting, setDeleting] = useState<string[] | null>(null);
  const toggleSelection = (callsigns: string[], checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current);
      for (const callsign of callsigns) {
        if (checked) next.add(callsign);
        else next.delete(callsign);
      }
      return next;
    });
  };

  const managementColumns: ColumnDef<RichTableFeatures, AtcPositionRow>[] = canManage
    ? [
        {
          id: "selection",
          enableSorting: false,
          enableColumnFilter: false,
          header: ({ table }) => {
            const callsigns = table.getRowModel().rows.map((row) => row.original.callsign);
            const count = callsigns.filter((callsign) => selected.has(callsign)).length;
            return (
              <Checkbox
                aria-label={t`Select all positions on this page`}
                checked={callsigns.length > 0 && count === callsigns.length}
                indeterminate={count > 0 && count < callsigns.length}
                disabled={callsigns.length === 0}
                onCheckedChange={(nextChecked) => {
                  const event = nextChecked;
                  return toggleSelection(callsigns, event);
                }}
              />
            );
          },
          cell: ({ row }) => {
            const callsign = row.original.callsign;
            return (
              <Checkbox
                aria-label={t`Select ${callsign}`}
                checked={selected.has(callsign)}
                onCheckedChange={(nextChecked) => {
                  const event = nextChecked;
                  return toggleSelection([callsign], event);
                }}
              />
            );
          },
        },
        {
          id: "actions",
          header: () => <Trans>Actions</Trans>,
          enableSorting: false,
          enableColumnFilter: false,
          cell: ({ row }) => (
            <div className="flex gap-1">
              <Button
                onClick={() => setAction({ kind: "edit", position: row.original })}
                variant={"neutral"}
                size={"sm"}
              >
                <Trans>Edit</Trans>
              </Button>
              <Button
                onClick={() => setAction({ kind: "delete", position: row.original })}
                variant={"neutral"}
                size={"sm"}
              >
                <Trans>Delete</Trans>
              </Button>
            </div>
          ),
        },
      ]
    : [];
  const { data, error, isLoading } = $api.useQuery("get", "/api/atc/positions");
  const sectorIds = useQuery({
    queryKey: ["atc-position-sector-ids"],
    queryFn: loadSectorIds,
    staleTime: Infinity,
    retry: 1,
  });
  const positions = useMemo<AtcPositionRow[]>(
    () =>
      (data ?? []).map((position) => ({
        ...position,
        ...(sectorIds.data?.get(position.callsign.toUpperCase())
          ? { sectorId: sectorIds.data.get(position.callsign.toUpperCase()) }
          : {}),
      })),
    [data, sectorIds.data],
  );
  const selectedCallsigns = (data ?? [])
    .filter((position) => selected.has(position.callsign))
    .map((position) => position.callsign);
  const selectedCount = selectedCallsigns.length;
  const groupedPositions = useMemo(() => {
    const groups: Record<AtcPositionGroup, Record<string, AtcPositionRow[]>> = {
      airport: {},
      terminal: {},
      area: {},
    };
    for (const position of positions) {
      const group = getAtcPositionGroup(position.callsign);
      const code = getAtcPositionCode(position.callsign);
      (groups[group][code] ??= []).push(position);
    }
    return Object.fromEntries(
      (Object.keys(groups) as AtcPositionGroup[]).map((group) => [
        group,
        Object.entries(groups[group])
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([code, positions]) => ({ code, positions })),
      ]),
    ) as Record<AtcPositionGroup, { code: string; positions: AtcPositionRow[] }[]>;
  }, [positions]);
  const positionCount = (group: AtcPositionGroup) =>
    groupedPositions[group].reduce((count, item) => count + item.positions.length, 0);
  const filteredPositions = useMemo(
    () =>
      Object.fromEntries(
        (Object.keys(groupedPositions) as AtcPositionGroup[]).map((group) => {
          const groupFilters = filters[group] ?? EMPTY_FILTERS;
          return [
            group,
            groupedPositions[group]
              .map(({ code, positions }) => ({
                code,
                positions: positions.filter((position) => matchesFilters(position, groupFilters)),
              }))
              .filter(({ positions }) => positions.length > 0),
          ];
        }),
      ) as Record<AtcPositionGroup, { code: string; positions: AtcPositionRow[] }[]>,
    [filters, groupedPositions],
  );
  const allFilteredPositions = useMemo(
    () =>
      Object.fromEntries(
        (Object.keys(filteredPositions) as AtcPositionGroup[]).map((group) => [
          group,
          filteredPositions[group].flatMap(({ positions }) => positions),
        ]),
      ) as Record<AtcPositionGroup, AtcPositionRow[]>,
    [filteredPositions],
  );
  const updateFilters = (group: AtcPositionGroup, patch: Partial<AtcPositionFilters>) =>
    setFilters((current) => ({ ...current, [group]: { ...EMPTY_FILTERS, ...current[group], ...patch } }));
  const tableColumns = canManage ? [managementColumns[0], ...columns, ...managementColumns.slice(1)] : columns;

  return (
    <main className="container mx-auto flex flex-col gap-4">
      <h1 className="text-3xl">
        <Trans>ATC Positions and Frequencies</Trans>
      </h1>
      <Alert>
        <AlertDescription>
          <Trans>
            CPDLC availability is decided by the controller. It is used at or above 7,800 meters; refer to the
            controller&apos;s ATC information.
          </Trans>
        </AlertDescription>
      </Alert>
      {error && (
        <Alert variant={"destructive"}>
          <AlertTitle>{<Trans>Failed to load ATC positions</Trans>}</AlertTitle>
          <AlertDescription>{error.detail}</AlertDescription>
        </Alert>
      )}
      {canManage && (
        <div className="flex gap-2">
          <Button onClick={() => setAction({ kind: "create" })}>
            <Trans>Create ATC Position</Trans>
          </Button>
          <Button variant="default" onClick={() => setBatchCreating(true)}>
            <Trans>Batch Create ATC Positions</Trans>
          </Button>
          <Button disabled={selectedCount === 0 || isLoading || !!error} onClick={() => setDeleting(selectedCallsigns)}>
            <Trans>Delete selected ({selectedCount})</Trans>
          </Button>
        </div>
      )}
      {canManage && action && <PositionModal action={action} onClose={() => setAction(null)} />}
      {canManage && batchCreating && <BatchCreateModal onClose={() => setBatchCreating(false)} />}
      {canManage && deleting && (
        <BatchDeleteModal
          callsigns={deleting}
          onDeleted={(callsign) => toggleSelection([callsign], false)}
          onClose={() => setDeleting(null)}
        />
      )}
      <Tabs defaultValue="airport">
        <TabsList className="mb-2">
          <TabsTrigger value="airport">
            <span className="flex items-center gap-2">
              <Trans>Airport</Trans>
              <Badge>{positionCount("airport")}</Badge>
            </span>
          </TabsTrigger>
          <TabsTrigger value="terminal">
            <span className="flex items-center gap-2">
              <Trans>Terminal</Trans>
              <Badge>{positionCount("terminal")}</Badge>
            </span>
          </TabsTrigger>
          <TabsTrigger value="area">
            <span className="flex items-center gap-2">
              <Trans>Area</Trans>
              <Badge>{positionCount("area")}</Badge>
            </span>
          </TabsTrigger>
        </TabsList>
        {(Object.keys(groupedPositions) as AtcPositionGroup[]).map((group) => {
          const selectedCode = selectedCodes[group] ?? ALL_POSITION_CODES;
          const selectedPositions =
            selectedCode === ALL_POSITION_CODES
              ? allFilteredPositions[group]
              : (filteredPositions[group].find(({ code }) => code === selectedCode)?.positions ?? []);
          const groupFilters = filters[group] ?? EMPTY_FILTERS;
          const groupTableColumns =
            group === "area" ? tableColumns : tableColumns.filter((column) => column.id !== "cpdlc");
          return (
            <TabsContent key={group} value={group}>
              <div
                className={
                  group === "area"
                    ? "mb-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-9"
                    : "mb-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8"
                }
              >
                <label className="grid gap-1.5 text-sm">
                  <span className="font-heading">{group === "area" ? t`Area` : t`Airport`}</span>
                  <NativeSelect
                    aria-label={group === "area" ? t`Area` : t`Airport`}
                    value={selectedCode ?? ""}
                    onChange={(event) => {
                      const value = event.currentTarget.value || null;
                      return value && setSelectedCodes((current) => ({ ...current, [group]: value }));
                    }}
                  >
                    <NativeSelectOption value=""></NativeSelectOption>
                    {[
                      { value: ALL_POSITION_CODES, label: `${t`All`} (${positionCount(group)})` },
                      ...groupedPositions[group].map(({ code, positions }) => ({
                        value: code,
                        label: `${code} (${positions.length})`,
                      })),
                    ].map((option) => {
                      const item = typeof option === "string" ? { value: option, label: option } : option;
                      return (
                        <NativeSelectOption key={item.value} value={item.value}>
                          {item.label}
                        </NativeSelectOption>
                      );
                    })}
                  </NativeSelect>
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-heading">{t`ATC Position`}</span>
                  <Input
                    aria-label={t`ATC Position`}
                    value={groupFilters.callsign}
                    onChange={(event) => updateFilters(group, { callsign: event.currentTarget.value })}
                  />
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-heading">{t`Sector ID`}</span>
                  <Input
                    aria-label={t`Sector ID`}
                    value={groupFilters.sectorId}
                    onChange={(event) => updateFilters(group, { sectorId: event.currentTarget.value })}
                  />
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-heading">{t`Category`}</span>
                  <NativeSelect
                    aria-label={t`Category`}
                    value={groupFilters.category ?? ""}
                    onChange={(event) => {
                      const value = event.currentTarget.value || null;
                      return updateFilters(group, { category: value as AtcPosition["category"] | null });
                    }}
                  >
                    <NativeSelectOption value=""></NativeSelectOption>
                    {(POSITION_CATEGORIES.map(({ value, label }) => ({ value, label: i18n._(label) })) ?? []).map(
                      (option) => {
                        const item = typeof option === "string" ? { value: option, label: option } : option;
                        return (
                          <NativeSelectOption key={item.value} value={item.value}>
                            {item.label}
                          </NativeSelectOption>
                        );
                      },
                    )}
                  </NativeSelect>
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-heading">{t`Chinese Callsign`}</span>
                  <Input
                    aria-label={t`Chinese Callsign`}
                    value={groupFilters.callsignZh}
                    onChange={(event) => updateFilters(group, { callsignZh: event.currentTarget.value })}
                  />
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-heading">{t`English Callsign`}</span>
                  <Input
                    aria-label={t`English Callsign`}
                    value={groupFilters.callsignEn}
                    onChange={(event) => updateFilters(group, { callsignEn: event.currentTarget.value })}
                  />
                </label>
                <label className="grid gap-1.5 text-sm">
                  <span className="font-heading">{t`Frequency`}</span>
                  <Input
                    aria-label={t`Frequency`}
                    value={groupFilters.frequency}
                    onChange={(event) => updateFilters(group, { frequency: event.currentTarget.value })}
                  />
                </label>
                {group === "area" && (
                  <label className="grid gap-1.5 text-sm">
                    <span className="font-heading">{"CPDLC"}</span>
                    <Input
                      aria-label={"CPDLC"}
                      value={groupFilters.cpdlc}
                      onChange={(event) => updateFilters(group, { cpdlc: event.currentTarget.value })}
                    />
                  </label>
                )}
                <label className="grid gap-1.5 text-sm">
                  <span className="font-heading">{t`Remarks`}</span>
                  <Input
                    aria-label={t`Remarks`}
                    value={groupFilters.remarks}
                    onChange={(event) => updateFilters(group, { remarks: event.currentTarget.value })}
                  />
                </label>
              </div>
              <RichTable
                data={selectedPositions}
                columns={groupTableColumns}
                isLoading={isLoading || sectorIds.isPending}
                initialState={{ pagination: { pageIndex: 0, pageSize: 50 } }}
                hideGlobalSearch
                hideColumnFilters
              />
            </TabsContent>
          );
        })}
      </Tabs>
    </main>
  );
}
