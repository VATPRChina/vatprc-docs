# AGENTS.md

## Setup

Follow `README.md`.

## Code Style

For general structure, follow [Modular Monolith](https://software-architecture-guild.com/guide/architecture/styles/modular-monolith/)
and [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html).

Each module in `src/modules` holds a business domain, with business models in
`model.rs`, database access in `repository.rs`, use cases in
`service.rs`, HTTP handlers in `route.rs` and request/response types in `dto.rs`.
When a layer spans several files, use the same singular module name for its directory.

Keep repositories private to the domain. Call the owning service for cross-domain
operations. Each domain owns its database tables. Every application query must read
and write only tables owned by its domain, including joins, subqueries, exports and
read-only projections. Combine results from the owning services when a response
needs data from multiple domains. Use bulk lookups for collections.

For tables with overlapping names, `controller` owns `user_atc_status` and
`user_atc_permission`. The `user` domain owns `user`, `session` and
`device_authorization`. The `event` domain owns `event_atc_position_booking`,
which references bookings owned by `atc_booking`.

Wire service dependencies in `src/services.rs` so handlers can use
the configured instances. Keep database queries and query-specific row types in the repository layer.
Use DTO conversions at the HTTP boundary and map service errors to HTTP responses there.

Use eventual consistency across domains. Execute single-statement writes directly.
Use a transaction when related writes must succeed together or a row lock protects
a decision such as assigning an open slot. Perform outbound notifications after commit.

`README.md` is for high-level project-level overviews. Do not include feature descriptions
as part of it.

## Tests

Place HTTP integration tests under `e2e/src`, following the endpoint path after
`/api`. For example, tests for `GET /api/atc/applications/review-sheet` belong in
`e2e/src/atc/applications/review-sheet.test.ts`. Use `getClient` from
`e2e/lib/backend.ts` for authentication and Vitest's `extend` to share role-specific
clients and fixture setup. Use `getBaseUrl()` for assertions that depend on the
test server address. Keep Rust unit tests alongside the behavior they exercise.
