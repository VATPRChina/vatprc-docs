import { geojsonExtension } from "./extension/geojson-extension";
import { MarkdownContent } from "./markdown-content";
import { renderComponent } from "@/test/render-component";
import { parseMarkdown } from "@tanstack/markdown/parser";
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import type { MapProps } from "@vis.gl/react-maplibre";
import type { Map as MapLibre } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { expect, test, vi } from "vitest";

const maps: MapLibre[] = [];
vi.mock("@/components/airspace/map", async (importOriginal) => {
  const { Map } = await importOriginal<typeof import("@/components/airspace/map")>();
  return {
    Map: (props: MapProps) => (
      <Map {...props} mapStyle={{ version: 8, sources: {}, layers: [] }} onLoad={(event) => maps.push(event.target)} />
    ),
  };
});

const mapDocument = (...values: unknown[]) => {
  const source = values.map((value) => ["```geojson", JSON.stringify(value), "```"].join("\n")).join("\n\n");
  return { markdown: parseMarkdown(source, { extensions: [geojsonExtension()] }) };
};

test("fits and renders each map and disposes maps on document navigation", { timeout: 30_000 }, async () => {
  const docs = {
    airport: mapDocument(
      { type: "Point", coordinates: [116, 40] },
      {
        type: "GeometryCollection",
        geometries: [
          {
            type: "LineString",
            coordinates: [
              [0, 0],
              [2, 2],
            ],
          },
          {
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [2, 0],
                [2, 2],
                [0, 0],
              ],
            ],
          },
        ],
      },
    ),
    overview: mapDocument({ type: "Feature", properties: null, geometry: null }),
    plain: { markdown: parseMarkdown("# Plain") },
  };
  const root = createRootRoute();
  const route = createRoute({
    getParentRoute: () => root,
    path: "/docs/$",
    component: () => {
      const { _splat } = route.useParams();
      return <MarkdownContent {...docs[_splat as keyof typeof docs]} />;
    },
  });
  const router = createRouter({
    routeTree: root.addChildren([route]),
    history: createMemoryHistory({ initialEntries: ["/docs/airport"] }),
  });
  const screen = await renderComponent(<RouterProvider router={router} />);
  await expect.poll(() => maps.length, { timeout: 15_000 }).toBe(2);
  const [airport, area] = [...maps].sort((a, b) => b.getCenter().lng - a.getCenter().lng);
  expect(airport.getCenter().lng).toBeCloseTo(116);
  expect(airport.getZoom()).toBeCloseTo(12);
  expect(area.getCenter().lng).toBeCloseTo(1);
  for (const [map, layer] of [
    [airport, "point"],
    [area, "line"],
    [area, "fill"],
  ] as const) {
    await expect
      .poll(() => map.queryRenderedFeatures({ layers: ["markdown-geojson-" + layer] }).length, { timeout: 10_000 })
      .toBeGreaterThan(0);
  }
  const removed = maps.map((map) => vi.spyOn(map, "remove"));
  await router.navigate({ to: "/docs/$", params: { _splat: "overview" } });
  await expect.poll(() => maps.length).toBe(3);
  for (const remove of removed) expect(remove).toHaveBeenCalledOnce();
  expect(maps[2].getCenter().toArray()).toEqual([105, 35]);
  expect(maps[2].getZoom()).toBe(3);
  await router.navigate({ to: "/docs/$", params: { _splat: "plain" } });
  await expect.element(screen.getByRole("heading", { name: "Plain" })).toBeVisible();
  expect(document.querySelectorAll(".maplibregl-map")).toHaveLength(0);
  await screen.unmount();
});
