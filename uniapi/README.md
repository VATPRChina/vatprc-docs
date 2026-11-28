# VATPRC UniAPI

This project targets providing an universal API server for all the services VATPRC requires.

## Architecture

Business domains live in `src/modules`. The application wires their services together in
`src/services.rs` and registers HTTP routes in `src/app.rs`. See [AGENTS.md](AGENTS.md)
for the module layout and contribution guidelines.

## Development

The application binary supports these commands:

```sh
vatprc-uniapi              # start the web application
vatprc-uniapi run          # start the web application
vatprc-uniapi openapi      # save the specification to openapi.json
vatprc-uniapi openapi -o api.json
vatprc-uniapi migrate      # apply pending database migrations
vatprc-uniapi --help       # list commands and options
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

Run `cargo test --locked` for Rust tests. The navigation tests also use the sample
`data/navdata.db` prepared by [the UniAPI CI workflow](../.github/workflows/ci-uniapi.yml).
The HTTP tests run with `pnpm test` in `e2e/` against a migrated test PostgreSQL database
and a local VATSIM feed.

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
