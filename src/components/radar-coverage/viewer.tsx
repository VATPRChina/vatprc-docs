import { RadarMap } from "./map";
import { BUILTIN_REGIONS, loadRegion } from "@/lib/radar-coverage/data";
import { decodeTerrain, RADAR_COLORS, terrainMeters } from "@/lib/radar-coverage/model";
import { CoverageRequest, CoverageResult, RADAR_TYPES, RadarRegion, RadarType } from "@/lib/radar-coverage/types";
import { Trans, useLingui } from "@lingui/react/macro";
import { Alert, Badge, Button, Checkbox, Loader, Select, Slider } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

const EMPTY_REGION: RadarRegion = { code: "local", name: "", boundary: [], radars: [] };
const QUICK_HEIGHTS = [0, 3000, 10000, 20000, 30000, 40000];
function useCoverage(region: RadarRegion, altitude: number, enabled: RadarType[]) {
  const [state, setState] = useState<{
    request: CoverageRequest;
    result: CoverageResult | null;
    failed: boolean;
  } | null>(null);
  const request = useMemo(() => ({ region, altitude, enabled }), [region, altitude, enabled]);
  const canCalculate = !!region.terrain && region.radars.length > 0;
  useEffect(() => {
    if (!canCalculate) return;
    let worker: Worker | undefined;
    // Debounce slider changes and terminate stale work, including on route exit.
    const timer = setTimeout(() => {
      try {
        worker = new Worker(new URL("../../lib/radar-coverage/coverage.worker.ts", import.meta.url), {
          type: "module",
        });
        worker.onmessage = (event: MessageEvent<{ result?: CoverageResult; error?: boolean }>) => {
          setState({ request, result: event.data.result ?? null, failed: !!event.data.error });
          worker?.terminate();
        };
        worker.onerror = () => {
          setState({ request, result: null, failed: true });
          worker?.terminate();
        };
        worker.postMessage(request);
      } catch {
        setState({ request, result: null, failed: true });
      }
    }, 150);
    return () => {
      clearTimeout(timer);
      worker?.terminate();
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
  const [airspaceEnabled, setAirspaceEnabled] = useState<string[]>(["tma", "twr"]);
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
  const { coverage, pending, failed } = useCoverage(region, altitude, enabled);
  const terrain = useMemo(() => (region.terrain ? decodeTerrain(region.terrain) : null), [region]);
  const radar = selected === null ? undefined : region.radars[selected];
  const ground =
    radar && terrain && region.terrain ? terrainMeters(region.terrain, terrain, [radar.lat, radar.lon]) : null;
  useEffect(() => {
    setMounted(true);
  }, []);
  const stationHeight = radar && ground !== null ? Math.max(radar.elevation, ground * 3.28084) : null;
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
        <Alert color="red">
          <Trans>Region data could not be loaded.</Trans>{" "}
          <Button
            size="compact-xs"
            variant="subtle"
            onClick={() => {
              void builtin.refetch();
            }}
          >
            <Trans>Retry</Trans>
          </Button>
        </Alert>
      )}
      <div className="grid items-start gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="flex flex-col gap-5 border border-black/15 p-4 dark:border-white/20">
          <Select
            label={t`Flight information region`}
            placeholder={t`No region loaded`}
            value={code}
            data={BUILTIN_REGIONS.map((r) => ({ value: r.code, label: r.name }))}
            onChange={(value) => {
              setCode(value);
              setSelected(null);
            }}
            allowDeselect={false}
          />
          <section className="flex flex-col gap-3">
            <h2 className="font-medium">
              <Trans>Target altitude</Trans>
            </h2>
            <span className="text-3xl font-medium">
              {format(altitude)} <span className="text-sm">ft MSL</span>{" "}
              <span className="text-sm font-normal whitespace-nowrap text-gray-600 dark:text-gray-400">
                {format(Math.round(altitude * 0.3048))} m
              </span>
            </span>
            <Slider
              value={altitude}
              onChange={setAltitude}
              min={0}
              max={60000}
              step={500}
              label={(value) => `${format(value)} ft / ${format(Math.round(value * 0.3048))} m`}
              thumbLabel={t`Target altitude`}
            />
            <div className="flex flex-wrap gap-1">
              {QUICK_HEIGHTS.map((height) => (
                <Button
                  key={height}
                  size="compact-xs"
                  variant={altitude === height ? "filled" : "default"}
                  onClick={() => setAltitude(height)}
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
              <Checkbox
                key={type}
                color={RADAR_COLORS[type]}
                checked={enabled.includes(type)}
                onChange={(event) => {
                  const checked = event.currentTarget.checked;
                  setEnabled((current) => (checked ? [...current, type] : current.filter((value) => value !== type)));
                  if (!checked && radar?.type === type) setSelected(null);
                }}
                label={
                  <span className="flex items-center gap-2">
                    {type === "ADSB" ? "ADS-B" : type}
                    <Badge color={RADAR_COLORS[type]} variant="light">
                      {region.radars.filter((r) => r.type === type).length}
                    </Badge>
                  </span>
                }
              />
            ))}
            <span className="flex items-center gap-2 text-sm">
              <span className="h-3 w-3 shrink-0" style={{ backgroundColor: RADAR_COLORS.fusion }} aria-hidden="true" />
              <Trans>SSR and ADS-B fusion</Trans>
            </span>
          </section>
          <section className="flex flex-col gap-2">
            <h2 className="font-medium">
              <Trans>Airspace boundaries</Trans>
            </h2>
            {(["tma", "twr"] as const).map((type) => (
              <Checkbox
                key={type}
                label={`${type.toUpperCase()} (${region.airspace?.[type].length ?? 0})`}
                color={type === "tma" ? "green" : "pink"}
                checked={airspaceEnabled.includes(type)}
                onChange={(event) => {
                  const checked = event.currentTarget.checked;
                  setAirspaceEnabled((current) =>
                    checked ? [...current, type] : current.filter((value) => value !== type),
                  );
                }}
              />
            ))}
          </section>
          <dl className="grid grid-cols-2 gap-2 border-t border-black/15 pt-3 text-sm dark:border-white/20">
            <dt>
              <Trans>FIR coverage estimate</Trans>
            </dt>
            <dd className="text-right font-medium" aria-live="polite">
              {pending ? (
                <Loader size="xs" aria-label={t`Calculating coverage`} />
              ) : coverage?.percentage == null ? (
                "—"
              ) : (
                `${coverage.percentage}%`
              )}
            </dd>
            <dt>
              <Trans>Visible radars</Trans>
            </dt>
            <dd className="text-right">
              {region.radars.filter((r) => enabled.includes(r.type)).length} / {region.radars.length}
            </dd>
          </dl>
          {region.radars.length > 0 && (!region.terrain || !region.boundary.length) && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <Trans>
                Coverage calculation requires both a FIR boundary and DEM data. Dashed rings show XML MaxRange only.
              </Trans>
            </p>
          )}
          {failed && (
            <Alert color="red">
              <Trans>Coverage calculation failed. Please reload the page.</Trans>
            </Alert>
          )}
          {coverage && coverage.percentage === null && (
            <p className="text-sm">
              <Trans>
                Some terrain samples are missing. Grey areas are unknown; a complete coverage percentage is unavailable.
              </Trans>
            </p>
          )}
          <Select
            searchable
            clearable
            label={t`Radar details`}
            placeholder={t`Select a radar or click its map marker`}
            value={selected === null ? null : String(selected)}
            onChange={(value) => setSelected(value === null ? null : Number(value))}
            data={region.radars.flatMap((r, index) =>
              enabled.includes(r.type) ? [{ value: String(index), label: `${r.name} · ${r.type}` }] : [],
            )}
          />
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
              enabled={enabled}
              airspaceEnabled={airspaceEnabled}
              coverage={coverage}
              onSelectRadar={setSelected}
            />
          ) : (
            <div className="flex h-96 items-center justify-center border">
              <Loader aria-label={t`Loading map`} />
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
