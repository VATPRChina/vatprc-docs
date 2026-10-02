import { MarkdownContent } from "./markdown-content";
import { compileMarkdownDoc } from "./markdown-doc-compile";
import type { MapProps, MapRef } from "@vis.gl/react-maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { expect, test, vi } from "vitest";
import { render } from "vitest-browser-react";

const { maps, errors } = vi.hoisted(() => ({ maps: [] as MapRef[], errors: [] as Error[] }));

// Use the real bundled worker and WebGL map, with an offline style and captured refs.
vi.mock("@/assets/map/voyager_without_boundary.json", () => ({
  default: { version: 8, sources: {}, layers: [] },
}));
vi.mock("@/components/airspace/map", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/components/airspace/map")>();
  return {
    Map: (props: MapProps) => (
      <actual.Map
        {...props}
        ref={(map) => {
          if (map && !maps.includes(map)) maps.push(map);
        }}
        onError={(event) => errors.push(event.error)}
      />
    ),
  };
});

test("renders Markdown GeoJSON islands and replaces them when the document changes", { timeout: 20_000 }, async () => {
  const geometry = {
    type: "GeometryCollection",
    geometries: [
      { type: "Point", coordinates: [0, 0] },
      {
        type: "LineString",
        coordinates: [
          [-1, 0],
          [1, 0],
        ],
      },
      {
        type: "Polygon",
        coordinates: [
          [
            [-1, -1],
            [1, -1],
            [1, 1],
            [-1, -1],
          ],
        ],
      },
    ],
  };
  const document = await compileMarkdownDoc(
    `# Map\n\n\`\`\`geojson\n${JSON.stringify(geometry)}\n\`\`\`\n\n> \`\`\`geojson\n> {"type":"Point","coordinates":[116.6,40.1]}\n> \`\`\``,
  );
  const screen = await render(<MarkdownContent document={document} />);
  await expect.poll(() => maps.length).toBe(2);
  for (const layer of ["fill", "line", "point"]) {
    await expect
      .poll(
        () =>
          maps[0]?.getLayer(`markdown-geojson-${layer}`)
            ? maps[0].queryRenderedFeatures({ layers: [`markdown-geojson-${layer}`] }).length
            : 0,
        {
          timeout: 10_000,
        },
      )
      .toBeGreaterThan(0);
  }
  await expect
    .poll(
      () =>
        maps[1]?.getLayer("markdown-geojson-point")
          ? maps[1].queryRenderedFeatures({ layers: ["markdown-geojson-point"] }).length
          : 0,
      { timeout: 10_000 },
    )
    .toBeGreaterThan(0);
  expect(errors).toEqual([]);
  expect(screen.container.querySelectorAll('[aria-label="GeoJSON map"]')).toHaveLength(2);
  expect(screen.container.querySelectorAll("[data-markdown-geojson]")).toHaveLength(2);
  expect(screen.container.querySelectorAll("[data-markdown-geojson] > details")).toHaveLength(2);

  await screen.rerender(<MarkdownContent document={await compileMarkdownDoc("# Updated\n\nNo maps")} />);
  expect(screen.container.querySelectorAll("[data-markdown-geojson]")).toHaveLength(0);
  expect(screen.container.textContent).toContain("Updated");
  await screen.unmount();
});
