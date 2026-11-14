import { RadarMap } from "./map";
import { AlertDescription, Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { Slider } from "@/components/ui/slider";
import { airspaceEntries, airspaceHeight } from "@/lib/radar-coverage/airspace";
import { BUILTIN_REGIONS, loadRegion } from "@/lib/radar-coverage/data";
import {
  AIRSPACE_TYPES,
  CoverageRequest,
  CoverageResult,
  RADAR_TYPES,
  RadarRegion,
  RadarType,
} from "@/lib/radar-coverage/types";
import { Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";

const EMPTY_REGION: RadarRegion = { code: "local", name: "", boundary: [], radars: [] };
const QUICK_HEIGHTS = [0, 3000, 10000, 20000, 30000, 40000];
function useCoverage(region: RadarRegion, altitude: number, enabled: RadarType[], selectedRadar: number | null) {
  const [state, setState] = useState<{
    request: CoverageRequest;
    result: CoverageResult | null;
    failed: boolean;
  } | null>(null);
  const request = useMemo(
    () => ({ region, altitude, enabled, selectedRadar }),
    [region, altitude, enabled, selectedRadar],
  );
  const canCalculate = region.radars.length > 0;
  const workerRef = useRef<Worker | null>(null);
  const active = useRef<{ id: number; request: CoverageRequest } | null>(null);
  const nextId = useRef(0);
  useEffect(() => {
    try {
      const worker = new Worker(new URL("../../lib/radar-coverage/coverage.worker.ts", import.meta.url), {
        type: "module",
      });
      workerRef.current = worker;
      worker.onmessage = (event: MessageEvent<{ id: number; result?: CoverageResult; error?: boolean }>) => {
        const current = active.current;
        if (!current || event.data.id !== current.id) return;
        setState({ request: current.request, result: event.data.result ?? null, failed: !!event.data.error });
      };
      worker.onerror = () => {
        if (active.current) setState({ request: active.current.request, result: null, failed: true });
      };
      return () => {
        workerRef.current = null;
        worker.terminate();
      };
    } catch {
      workerRef.current = null;
    }
  }, []);
  useEffect(() => {
    if (!canCalculate) return;
    const id = ++nextId.current;
    active.current = { id, request };
    const timer = setTimeout(() => {
      if (!workerRef.current) {
        setState({ request, result: null, failed: true });
        return;
      }
      workerRef.current.postMessage({ id, request });
    }, 150);
    return () => {
      clearTimeout(timer);
      active.current = null;
      workerRef.current?.postMessage({ id });
    };
  }, [request, canCalculate]);
  return {
    coverage: canCalculate && state?.request === request ? state.result : null,
    pending: canCalculate && state?.request !== request,
    failed: canCalculate && state?.request === request && state.failed,
  };
}
export function RadarCoverageViewer() {
  const { t, i18n } = useLingui();
  const [code, setCode] = useState<string | null>(BUILTIN_REGIONS[0].code);
  const [altitude, setAltitude] = useState(10000);
  const [enabled, setEnabled] = useState<RadarType[]>(["SSR", "ADSB"]);
  const [hiddenAirspaces, setHiddenAirspaces] = useState<string[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const builtin = useQuery({
    queryKey: ["radar-coverage-region", code],
    queryFn: () => loadRegion(code!),
    enabled: !!code,
    staleTime: Infinity,
    retry: 1,
  });
  const region = builtin.data ?? EMPTY_REGION;
  const loadingRegion = builtin.isPending;
  const { coverage, pending, failed } = useCoverage(region, altitude, enabled, selected);
  const entries = useMemo(() => airspaceEntries(region), [region]);
  const airspaceEnabled = useMemo(
    () => entries.filter((entry) => !hiddenAirspaces.includes(entry.key)).map((entry) => entry.key),
    [entries, hiddenAirspaces],
  );
  const radar = selected === null ? undefined : region.radars[selected];
  useEffect(() => {
    setMounted(true);
  }, []);
  const stationHeight = selected === null ? null : (coverage?.stationHeights[selected] ?? null);
  const format = (value: number) => i18n.number(value);
  return (
    <div className="container mx-auto flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl">
          <Trans>Radar Coverage</Trans>
        </h1>
      </div>
      {loadingRegion && (
        <p role="status">
          <Trans>Loading region data…</Trans>
        </p>
      )}
      {builtin.isError && (
        <Alert variant={"destructive"}>
          <AlertDescription>
            <Trans>Region data could not be loaded.</Trans>&nbsp;
            <Button
              onClick={() => {
                void builtin.refetch();
              }}
              variant={"neutral"}
              size={"xs"}
            >
              <Trans>Retry</Trans>
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <div className="grid items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-5 border border-black/15 p-4 dark:border-white/20">
          <label className="grid gap-1.5 text-sm">
            <span className="font-heading">{t`Flight information region`}</span>
            <NativeSelect
              aria-label={t`Flight information region`}
              value={code ?? ""}
              onChange={(event) => {
                const value = event.currentTarget.value || null;
                setCode(value);
                setSelected(null);
                setHiddenAirspaces([]);
              }}
            >
              <NativeSelectOption value="">{t`No region loaded`}</NativeSelectOption>
              {(BUILTIN_REGIONS.map((r) => ({ value: r.code, label: r.name })) ?? []).map((option) => {
                const item = typeof option === "string" ? { value: option, label: option } : option;
                return (
                  <NativeSelectOption key={item.value} value={item.value}>
                    {item.label}
                  </NativeSelectOption>
                );
              })}
            </NativeSelect>
          </label>
          <section className="flex flex-col gap-3">
            <h2 className="font-medium">
              <Trans>Target altitude</Trans>
            </h2>
            <span className="text-3xl font-medium">
              {format(altitude)}
              <span className="text-sm">ft MSL</span>&nbsp;
              <span className="text-sm font-normal whitespace-nowrap text-gray-600 dark:text-gray-400">
                {format(Math.round(altitude * 0.3048))} m
              </span>
            </span>
            <Slider
              min={0}
              max={60000}
              step={500}
              value={[altitude]}
              onValueChange={(value: number | readonly number[]) =>
                setAltitude(typeof value === "number" ? value : value[0])
              }
            />
            <div className="flex flex-wrap gap-1">
              {QUICK_HEIGHTS.map((height) => (
                <Button
                  key={height}
                  variant={altitude === height ? "default" : "neutral"}
                  onClick={() => setAltitude(height)}
                  size={"xs"}
                >
                  {format(height)}
                </Button>
              ))}
            </div>
          </section>
          <section className="flex flex-col gap-2">
            <h2 className="font-medium">
              <Trans>Surveillance sources</Trans>
            </h2>
            {RADAR_TYPES.map((type) => (
              <Label key={type} className="flex items-center gap-2">
                <Checkbox
                  checked={enabled.includes(type)}
                  onCheckedChange={(nextChecked) => {
                    const event = nextChecked;
                    const checked = event;
                    setEnabled((current) => (checked ? [...current, type] : current.filter((value) => value !== type)));
                    if (!checked && radar?.type === type) setSelected(null);
                  }}
                />
                <span>
                  {
                    <span className="flex items-center gap-2">
                      {type === "ADSB" ? "ADS-B" : type}
                      <Badge>{region.radars.filter((r) => r.type === type).length}</Badge>
                    </span>
                  }
                </span>
              </Label>
            ))}
            <span className="flex items-center gap-2 text-sm">
              <span className="h-3 w-3 shrink-0 bg-blue-600" aria-hidden="true" />
              <Trans>SSR and ADS-B fusion</Trans>
            </span>
          </section>
          <section className="flex flex-col gap-2">
            <h2 className="font-medium">
              <Trans>Airspace boundaries</Trans>
            </h2>
            {AIRSPACE_TYPES.map((type) => {
              const group = entries.filter((entry) => entry.type === type);
              const visible = group.filter((entry) => airspaceEnabled.includes(entry.key)).length;
              return (
                <details key={`${code}:${type}`} className="rounded border border-black/15 p-2 dark:border-white/20">
                  <summary className="cursor-pointer text-sm font-medium">
                    {type.toUpperCase()} ({visible}/{group.length})
                  </summary>
                  <div className="mt-3 flex flex-col gap-3">
                    <Label className="flex items-center gap-2">
                      <Checkbox
                        checked={group.length > 0 && visible === group.length}
                        indeterminate={visible > 0 && visible < group.length}
                        disabled={!group.length}
                        onCheckedChange={(nextChecked) => {
                          const event = nextChecked;
                          const checked = event;
                          setHiddenAirspaces((current) =>
                            checked
                              ? current.filter((key) => !group.some((entry) => entry.key === key))
                              : [...new Set([...current, ...group.map((entry) => entry.key)])],
                          );
                        }}
                      />
                      <span>{t`Select all`}</span>
                    </Label>
                    <div className="flex max-h-64 flex-col gap-3 overflow-y-auto pr-1">
                      {group.map((entry) => (
                        <Label key={entry.key} className="flex items-center gap-2">
                          <Checkbox
                            checked={airspaceEnabled.includes(entry.key)}
                            onCheckedChange={(nextChecked) => {
                              const event = nextChecked;
                              const checked = event;
                              setHiddenAirspaces((current) =>
                                checked ? current.filter((key) => key !== entry.key) : [...current, entry.key],
                              );
                            }}
                          />
                          <span>
                            {
                              <span className="flex flex-col">
                                <span>{entry.name}</span>
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                  {airspaceHeight(entry) ?? t`Altitude not provided`}
                                </span>
                              </span>
                            }
                          </span>
                        </Label>
                      ))}
                    </div>
                  </div>
                </details>
              );
            })}
            <p className="text-xs text-gray-600 dark:text-gray-400">
              <Trans>Airspace altitudes are in metres. Click the map to inspect all sectors at that position.</Trans>
            </p>
          </section>
          <dl className="grid grid-cols-2 gap-2 border-t border-black/15 pt-3 text-sm dark:border-white/20">
            <dt>
              <Trans>FIR coverage estimate</Trans>
            </dt>
            <dd className="text-right font-medium" aria-live="polite">
              {pending ? (
                <span
                  role="status"
                  aria-label={t`Calculating coverage`}
                  className={
                    "inline-block size-5 animate-spin rounded-full border-2 border-current border-t-transparent"
                  }
                />
              ) : coverage?.percentage == null ? (
                "—"
              ) : (
                `${coverage.percentage}%`
              )}
            </dd>
            <dt>
              <Trans>Radars used for coverage</Trans>
            </dt>
            <dd className="text-right">
              {radar ? 1 : region.radars.filter((r) => enabled.includes(r.type)).length}/{region.radars.length}
            </dd>
          </dl>
          {failed && (
            <Alert variant={"destructive"}>
              <AlertDescription>
                <Trans>Coverage calculation failed. Please reload the page.</Trans>
              </AlertDescription>
            </Alert>
          )}
          {coverage && coverage.percentage === null && (
            <p className="text-sm">
              <Trans>
                Some terrain samples are missing. Grey areas are unknown; a complete coverage percentage is unavailable.
              </Trans>
            </p>
          )}
          <label className="grid gap-1.5 text-sm">
            <span className="font-heading">{t`Radar details`}</span>
            <NativeSelect
              aria-label={t`Radar details`}
              value={(selected === null ? null : String(selected)) ?? ""}
              onChange={(event) => {
                const value = event.currentTarget.value || null;
                return setSelected(value === null ? null : Number(value));
              }}
            >
              <NativeSelectOption value="">{t`Select a radar or click its map marker`}</NativeSelectOption>
              {(
                region.radars.flatMap((r, index) =>
                  enabled.includes(r.type) ? [{ value: String(index), label: `${r.name} · ${r.type}` }] : [],
                ) ?? []
              ).map((option) => {
                const item = typeof option === "string" ? { value: option, label: option } : option;
                return (
                  <NativeSelectOption key={item.value} value={item.value}>
                    {item.label}
                  </NativeSelectOption>
                );
              })}
            </NativeSelect>
            <span className="text-foreground/70 text-xs">{t`Clear the selection to show all enabled radars.`}</span>
          </label>
          {radar && (
            <dl className="grid grid-cols-[minmax(0,1fr)_auto] gap-2 text-sm">
              <dt>
                <Trans>Computed station height</Trans>
              </dt>
              <dd className="flex flex-wrap items-baseline justify-end gap-x-1">
                {stationHeight === null ? (
                  "—"
                ) : (
                  <>
                    <span className="whitespace-nowrap">{format(Math.round(stationHeight))} ft</span>
                    <span className="text-xs whitespace-nowrap text-gray-600 dark:text-gray-400">
                      {format(Math.round(stationHeight * 0.3048))} m
                    </span>
                  </>
                )}
              </dd>
              <dt>
                <Trans>Maximum available coverage range</Trans>
              </dt>
              <dd className="flex flex-wrap items-baseline justify-end gap-x-1">
                <span className="whitespace-nowrap">{format(radar.maxRange)} NM</span>
                <span className="text-xs whitespace-nowrap text-gray-600 dark:text-gray-400">
                  {format(Math.round(radar.maxRange * 1.852 * 10) / 10)} km
                </span>
              </dd>
            </dl>
          )}
        </aside>
        <section className="flex min-w-0 flex-col gap-2">
          {mounted && builtin.data ? (
            <RadarMap
              region={region}
              key={code}
              selectedRadar={selected}
              enabled={enabled}
              airspaceEnabled={airspaceEnabled}
              coverage={coverage}
              onSelectRadar={setSelected}
            />
          ) : (
            <div className="flex h-96 items-center justify-center border">
              <span
                role="status"
                aria-label={t`Loading map`}
                className={"inline-block size-5 animate-spin rounded-full border-2 border-current border-t-transparent"}
              />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
