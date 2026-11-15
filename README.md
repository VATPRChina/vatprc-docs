# vatprc-docs

This is the code for VATPRC's website.

## Repository and containers

The frontend lives in `website/`, while shared documentation stays in `docs/` at
the repository root. The backend is imported from
<https://github.com/VATPRChina/uniapi> as a Git subtree under `uniapi/`, preserving its full commit history.
To update it, start with a clean working tree and run:

```sh
git subtree pull --prefix=uniapi https://github.com/VATPRChina/uniapi main
```

On pushes to `main`, the container workflows publish independently:

| Image                                    | Build context | Changes that trigger publishing                         | Tag                         |
| ---------------------------------------- | ------------- | ------------------------------------------------------- | --------------------------- |
| `ghcr.io/vatprchina/vatprc-docs/website` | `.`           | Any path outside `uniapi/`, except the UniAPI workflows | `1.1.<workflow run number>` |
| `ghcr.io/vatprchina/vatprc-docs/uniapi`  | `uniapi/`     | `uniapi/**` or `.github/workflows/container-uniapi.yml` | `1.1.<workflow run number>` |

The frontend image targets `linux/amd64`; UniAPI targets `linux/amd64` and
`linux/arm64`. The frontend Docker context and frontend formatting/type checks
exclude the backend subtree. See [UniAPI's README](uniapi/README.md) for backend
development instructions.

To build locally:

```sh
docker build -f website/Dockerfile -t ghcr.io/vatprchina/vatprc-docs/website .
docker build -t ghcr.io/vatprchina/vatprc-docs/uniapi ./uniapi
```

## Contributing

### Docs / SOP

The docs are placed under `docs/`. All markdown documents there are immediately
available on our website under <https://www.vatprc.net/docs>, despite there is no
listing for all docs.

For SOP docs, it requires review first by VATPRC3, and after VATPRC3 approves, it
requires assigning to VATPRC5 for approval. If both approved, the merge request
can be merged at discretion.

Temporarily, SOP pull requests automatically request review from
[Aaron Liu (1478665)](https://github.com/AaronZSAM101). When Aaron authors the
pull request, [Jingyuan Yin (1478847)](https://github.com/JingyuanYin) reviews it
instead. [Shengbo Yang](https://github.com/klc05) remains a reviewer for final
review. GitHub does not allow authors to review their own pull requests.

#### Image

This repository recommends against placing static assets inside the repository.
Please use an online image service, and include the absolute link to it.

- For VATPRC staff, you may use <https://www.vatprc.net/docs/utils/image>.
- For others, please use an online image CDN service.

### Code

For coding-related contributions, please reach out to VATPRC8 as there is no clear
document currently.

To run the server locally,

```console
cd website
pnpm install
pnpm dev
```

#### API

The backend API is well-defined with OpenAPI. Run frontend commands from
`website/`. Please run the following command to grab the latest API definition.

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
file-based routing. Create new page by creating relevant file in `website/src/routes`, and
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

And update `website/src/locales/zh-cn.po` to provide Chinese localization for the new
strings.

## License

&copy; 2010 - 2025, [VATSIM P.R. China Division](https://www.vatprc.net), All rights reserved.
