# VATPRC UniAPI

This project targets providing an universal API server for all the services VATPRC requires.

## Architecture

TODO.

## Development

The application binary supports these commands:

```sh
vatprc-uniapi              # start the web application
vatprc-uniapi run          # start the web application
vatprc-uniapi openapi      # save the specification to openapi.json
vatprc-uniapi openapi -o api.json
vatprc-uniapi migrate      # apply pending database migrations
vatprc-uniapi route-v2 "ZBAA ELKUR W40 YQG ZSPD" # print the complete parser trace
```

## Testing

Test routes are defined in `assets/test/routes.sql`. CI generates
`data/routes.db` from this SQL for both Rust and E2E tests. For local test setup,
create a new test database with:

```sh
mkdir -p data
sqlite3 -bail data/routes.db < assets/test/routes.sql
```

The database must not already contain route tables. Generated databases stay
under the ignored `data/` directory; no binary fixture is required.

The E2E setup starts a local VATSIM data feed with fixed pilots and prefiles,
so flight validation tests do not depend on live traffic or VATSIM availability.
The backend uses `utils.vatsim_data_url` (or `APP_UTILS__VATSIM_DATA_URL`) to
select the feed; it defaults to the public VATSIM data URL.

There is E2E testing for each API endpoint. It is still missing test coverage on some endpoints.

### Writing tests

Place the test for each API endpoint in `/e2e/src/**/*.test.ts`. The test folder structure should match the API endpoint's URL. For example, test for GET `/api/atc/applications/review-sheet` should be placed in `/e2e/src/atc/applications/review-sheet.test.ts` (prefix `/api` is stripped).

If a user is needed, check `getClient` from `/e2e/lib/backend.ts`. Use Vitest's `extend` to establish a shared context for different roles used in the same test file.

If some common data setup is required for the API endpoint (e.g. `/api/events` requires a present event), use Vitest's `extend` to establish a shared context to avoid duplication in setting up the data.

## License

    VATPRC UniAPI - Universal API endpoint for VATPRC
    Copyright (C) 2024 - 2026 VATPRC Staff

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <https://www.gnu.org/licenses/>.

### Contributor License Agreement

    By contributing to the repository, in addition to the open-source license attached
    to the repository, the contributors are additionally granting VATPRC staffs an
    unrevokeable right to use the code freely for any purposes related to VATSIM or
    VATPRC.
