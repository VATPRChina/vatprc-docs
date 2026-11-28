# VATPRC Website

## Architecture

TODO.

## Development

From `website/`, use the Node and pnpm versions specified in `package.json`.
Run `pnpm install` followed by `pnpm dev`. To use a local UniAPI instance,
set `VITE_API_DEV_ENDPOINT` in `.env.development.local`.

## Testing

Install Chromium with `pnpm exec playwright install chromium`. Run `pnpm lint`
for formatting, TypeScript, and ESLint checks, `pnpm test --run` for unit and
browser component tests, and `pnpm test:e2e` for mocked-backend page flows.

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
