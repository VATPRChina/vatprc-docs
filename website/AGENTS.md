# AGENTS.md

## Setup

Follow `README.md`.

## Code Style

The project uses React and TanStack Start.

- Prefer using arrow functions, even for React components. Use `React.FC` for the
  type of components. Keep generic components generic when their props depend on
  caller-inferred types.
- Prefer using named exports and avoid default exports. Keep default exports required by configuration loaders.
- Define route component constants before passing them to `createFileRoute`. Place components
  shared with tests or other routes in `src/components` so the router can split page bundles.
- Use kebab-case for feature modules, including files that export a PascalCase
  component. Follow TanStack Router’s file naming conventions under `src/routes`.
- Regenerate `src/routeTree.gen.ts` through TanStack Router and `src/lib/api.d.ts`
  with `pnpm build:api-local` after schema changes.

The project uses both [Mantine UI](https://mantine.dev/) and Tailwind CSS.

- Use Mantine UI components whenever possible, to maintain a consistent UX style.
- Use native HTML for typography. Choose heading levels by document structure,
  use `p` for paragraphs, and use `span` for inline text.
- Use Tailwind CSS for layout and typography, including font family, size, and weight.

Use [TanStack Query](https://tanstack.com/query) as the server-state layer. Use
`$api` in `src/lib/client.ts` for UniAPI queries and mutations. It wraps the typed
`openapi-fetch` client with `openapi-react-query`. Reuse `$api.queryOptions(...)`
when invalidating cached queries after a mutation.

Use [Lingui](https://lingui.dev/) with React macros for localization. Use `<Trans>` for JSX copy and
`useLingui().t` for string props such as accessible labels and placeholders. Run
`pnpm i18n:extract` and translate new messages in `src/locales/zh-cn.po`.

## Test

Colocate pure logic tests in `*.unit.test.ts` and component rendering tests in
`*.browser.test.tsx`. Use `renderComponent` from `src/test/render-component.tsx`
for the shared Mantine theme and English Lingui catalog. Cover each possible
rendered state, including loading, error, empty and success where applicable.

Cover page flows with Playwright tests in `e2e/*.spec.ts`. Mock backend responses
at the HTTP boundary and exercise navigation using the rendered controls. Run
`pnpm test:e2e` for these tests.
