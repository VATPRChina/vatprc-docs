# AGENTS.md

## Setup

Follow `README.md`.

## Code Style

For general structure, follow [Modular Monolith](https://software-architecture-guild.com/guide/architecture/styles/modular-monolith/)
and [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html). In `src/modules`, each module holds a business domain, and each domain should have
their own business models (`model.rs`), database access layers (`repository.rs`),
services (`service.rs`), APIs (`route.rs`) and DTOs (`dto.rs`). All operations across
modules should be invoking with each other's exposed services.

The data consistency requirement is eventual consistency. A temporary inconsistent
is tolerable. Avoid aggressively using transactions.

`README.md` is for high-level project-level overviews. Do not include feature descriptions
as part of it.
