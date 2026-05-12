# Stockwise

Production-ready inventory and stock management web app built on the TanStack ecosystem and deployed to Cloudflare Workers.

End-to-end type safety from server functions to React Query to forms, with Zod as the single source of truth for input validation.

## Stack

- TanStack Start (React 19, SSR, file-based routing, server functions)
- TanStack Router + TanStack Query (SSR-hydrated cache)
- Zod (input validation, server + client)
- Tailwind CSS v4
- Cloudflare Workers (Wrangler) for deployment
- Lucide React icons

## Features

- **Dashboard** with KPIs (product count, total units, inventory value, reorder count), low-stock list, and recent movements.
- **Products** list with URL-driven search, low/out filters, create modal, and per-product detail page.
- **Per-product** edit, delete, stock-adjust panel (in / out / adjust) and full movement history.
- **Stock movements** global audit trail.
- **Suppliers** list with inline create.
- Server-side stock invariants (no negative stock; atomic product + movement updates).

## Scaffold

This project was scaffolded with:

```bash
npx @tanstack/cli@latest create my-tanstack-app --agent --deployment cloudflare --add-ons tanstack-query
```

…then enhanced with TanStack Intent guidance:

```bash
npx @tanstack/intent@latest install
npx @tanstack/intent@latest list
```

The TanStack CLI scaffold is preserved as-is; inventory domain code (`src/server`, `src/lib/inventory`, `src/routes/products.*`, `src/routes/movements.tsx`, `src/routes/suppliers.tsx`, `src/components/inventory`) was added on top.

## Local development

```bash
npm install
npm run dev      # http://localhost:3000
```

`routeTree.gen.ts` is generated automatically by the TanStack Router Vite plugin on first dev/build.

## Build & deploy

```bash
npm run build
npm run deploy   # vite build && wrangler deploy
```

Cloudflare config lives in `wrangler.jsonc`. Authenticate with `wrangler login` or set `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` in CI.

## Environment

The demo runs with zero environment variables — the data store is an in-memory map seeded on first request. **It is not durable across Worker isolate evictions.**

For real deployments, replace `src/server/store.ts` with a Cloudflare binding:

- **D1** (SQL) — preferred for relational + audit trail.
- **KV** — simple key/value, eventually consistent.
- **Durable Objects** — strong consistency for stock counts.

Add the binding in `wrangler.jsonc` and keep all secrets server-side. Only `VITE_*` env vars reach the client.

## Project layout

```
src/
  routes/         # /, /products, /products/$id, /movements, /suppliers
  server/         # createServerFn handlers + store
  lib/inventory/  # Zod schemas, types, query factories
  components/     # Layout + inventory UI primitives
```

## Code review — CodeRabbit

PR reviews are handled by **CodeRabbit** as repository tooling (no in-app SDK). Configuration lives in [`.coderabbit.yaml`](./.coderabbit.yaml) with path-scoped instructions for `src/server`, `src/routes`, and shared Zod schemas.

Setup:

1. Install https://github.com/apps/coderabbitai on the org / repo.
2. Open a PR against `main` — CodeRabbit reviews it automatically.

## Hosting — Cloudflare

Cloudflare Workers is the deployment target. Configuration:

- `wrangler.jsonc` — entry point `@tanstack/react-start/server-entry`, `nodejs_compat` flag.
- `vite.config.ts` — `@cloudflare/vite-plugin` wired alongside `tanstackStart()`.

The full deployment story (D1 binding, custom domain, secrets) is handled in the Cloudflare dashboard / `wrangler` CLI — it depends on your account, so it is not pre-baked in this repo.

## Further docs

See [`AGENTS.md`](./AGENTS.md) for architectural decisions, data-layer migration notes, gotchas, and the next-steps backlog.
