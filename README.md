# vatprc-docs

This is the code for VATPRC's Homepage.

## Contributing

### Docs / SOP

The docs are placed under `docs/`. All markdown documents there are immediately
available on our website under <https://www.vatprc.net/docs>, despite there is no
listing for all docs.

For SOP docs, it requires review first by VATPRC3, and after VATPRC3 approves, it
requires assigning to VATPRC5 for approval. If both approved, the merge request
can be merged at discretion.

#### Image

This repository recommends against placing static assets inside the repository.
Please use an online image service, and include the absolute link to it.

- For VATPRC staff, you may use <https://www.vatprc.net/docs/utils/image>.
- For others, please use an online image CDN service.

#### GeoJSON maps

Use a fenced `geojson` block to embed an interactive map in a local or Discourse
Markdown document. Coordinates use longitude, latitude order. Features,
FeatureCollections, and bare geometries are supported, including points, lines,
polygons, multi-geometries, and GeometryCollections. Each block gets its own map,
with the view fitted to its geometry. The original JSON remains available in a
collapsible section; malformed JSON or invalid geometries render as code.

````markdown
```geojson
{
  "type": "Feature",
  "properties": {
    "name": "Beijing Capital"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [
      116.5975,
      40.0799
    ]
  }
}
```
````

### Code

For coding-related contributions, please reach out to VATPRC8 as there is no clear
document currently.

To run the server locally,

```console
pnpm install
pnpm dev
```

#### API

The backend API is well-defined with OpenAPI. Please run the following command
to grab the latest API definition.

```
pnpm build:api
```

And when using the API, import `$api` and make calls, which is a typesafe wrapper
over [TanStack Query](https://tanstack.com/query/latest).

```
import { $api } from "@/lib/client";
const { data: warnings } = $api.useQuery("get", "/api/flights/by-callsign/{callsign}/warnings", {
  params: { path: { callsign } },
});
```

#### Pages

This project is based on [TanStack Router](https://tanstack.com/router/latest)'s
file-based routing. Create new page by creating relevant file in `src/routes`, and
`pnpm dev` will automatically update the routing on the fly.

#### Localization

Please write English version of UI strings in the codebase, and wrap them with
[Lingui](https://lingui.dev/)'s [`Trans`](https://lingui.dev/ref/react#trans)
component.

After finishing the code, please run the following command to build localization
files:

```
pnpm i18n:extract
```

And update `src/locales/zh-cn.po` to provide Chinese localization for the new
strings.

## License

&copy; 2010 - 2025, [VATSIM P.R. China Division](https://www.vatprc.net), All rights reserved.
