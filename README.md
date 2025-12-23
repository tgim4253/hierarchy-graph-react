## hierarchy-graph-react Monorepo

Package README: [packages/hierarchy-graph-react/README.md](packages/hierarchy-graph-react/README.md)

This repo hosts the `@tgim/hierarchy-graph-react` package and a small playground app for local testing.

## Packages

- `packages/hierarchy-graph-react`: React components + layout helpers for hierarchical graphs
- `apps/playground`: Example app using the package

## Getting started

```bash
pnpm install
pnpm --filter playground dev
```

## Build & test

```bash
pnpm --filter @tgim/hierarchy-graph-react build
pnpm --filter @tgim/hierarchy-graph-react test:run
```

## Publish

```bash
pnpm --filter @tgim/hierarchy-graph-react build
npm publish --access public
```
