<!-- intent-skills:start -->
## Skill Loading

Before substantial work:
- Skill check: run `npx @tanstack/intent@latest list`, or use skills already listed in context.
- Skill guidance: if one local skill clearly matches the task, run `npx @tanstack/intent@latest load <package>#<skill>` and follow the returned `SKILL.md`.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

# Stockwise — Inventory & Stock Management

Production-ready inventory and stock management web app built on the TanStack ecosystem, deployed to Cloudflare Workers.

## Scaffold provenance

This project was scaffolded with the TanStack CLI:

```bash
npx @tanstack/cli@latest create my-tanstack-app --agent --deployment cloudflare --add-ons tanstack-query
```

Follow-up TanStack Intent commands:

```bash
npx @tanstack/intent@latest install
npx @tanstack/intent@latest list
```

The scaffold output was generated in a scratch directory and merged into this repository (replacing the prior landing page). Inventory domain code was added on top of the unchanged scaffold structure.

## Stack

- **TanStack Start** (React 19, file-based routing, server functions, SSR)
- **TanStack Router** with full type-safe routes (`routeTree.gen.ts`)
- **TanStack Query** for client cache + SSR hydration via `@tanstack/react-router-ssr-query`
- **Zod** as the single source of truth for input validation (server + client forms)
- **Tailwind CSS v4**
- **Cloudflare Workers** (Wrangler) for deployment
- **Lucide React** icons

## Project layout

```
src/
  routes/                       # File-based routes (TanStack Router)
    __root.tsx                  # HTML shell, head, devtools
    index.tsx                   # /  Dashboard (KPIs, low stock, recent movements)
    products.index.tsx          # /products  list, search, filters, create
    products.$id.tsx            # /products/$id  detail, edit, movements, delete
    movements.tsx               # /movements  global audit trail
    suppliers.tsx               # /suppliers  list + add
  server/
    store.ts                    # In-memory store (seeded) — swap for D1/KV in prod
    inventory.ts                # createServerFn handlers (list/create/update/etc.)
  lib/inventory/
    types.ts                    # Shared types (Product, StockMovement, Supplier)
    schemas.ts                  # Zod schemas for inputs
    queries.ts                  # queryOptions factories + cache key registry
  components/
    Header.tsx, Footer.tsx, ThemeToggle.tsx
    inventory/
      StockBadge.tsx            # Stock status pill (ok/low/out)
      ProductForm.tsx           # Reused for create + edit
  integrations/tanstack-query/  # Query client context + devtools panel
  router.tsx                    # getRouter() with SSR Query integration
  styles.css                    # Tailwind + form/button/table tokens
```

## Architectural decisions

- **Server functions over REST.** All inventory I/O goes through `createServerFn` so types flow end-to-end without an OpenAPI step.
- **Zod schemas live in `src/lib/inventory/schemas.ts`** and are imported by both the server validators (`.inputValidator(schema)`) and the React forms (`schema.safeParse(values)`).
- **TanStack Query keys are centralised** in `inventoryKeys` (`src/lib/inventory/queries.ts`). Mutations invalidate `inventoryKeys.all` to keep dashboard/list/detail consistent.
- **Loaders preload** with `context.queryClient.ensureQueryData(...)` so SSR hydrates the same cache the client uses.
- **Search params are typed** with `validateSearch` on `/products` (Zod), enabling URL-driven filters.
- **Stock invariants** are enforced server-side: `recordMovement` rejects negative stock and atomically updates product + movement log.

## Data layer

The current store is in-memory (`globalThis.__inventoryStore`) seeded with sample products, suppliers, and movements. **It does not persist across Worker isolate restarts.** Replace with one of:

- **Cloudflare D1** for relational queries (preferred for an audit trail).
- **Cloudflare KV** for key/value with eventual consistency.
- **Durable Objects** for strong consistency on stock counts.

Migration path: keep the `createServerFn` signatures stable and rewrite `src/server/store.ts` to call into the chosen storage binding. Bindings go in `wrangler.jsonc`.

## Environment variables

No app-level env vars are required for the demo. Real deployments will likely add:

- `CLOUDFLARE_API_TOKEN` (CI deploy)
- `CLOUDFLARE_ACCOUNT_ID` (CI deploy)
- Cloudflare bindings (D1 / KV / R2) declared in `wrangler.jsonc`

Keep all secrets server-side. Only `VITE_*` variables are exposed to the client bundle.

## Deployment

```bash
npm run build     # vite build
npm run deploy    # vite build && wrangler deploy
```

`wrangler.jsonc` is set up for `@tanstack/react-start/server-entry` with `nodejs_compat`. Cloudflare account/project setup is done in the Cloudflare dashboard or via `wrangler login`.

## CodeRabbit (PR review)

CodeRabbit is configured as repository tooling, not in-app code. See `.coderabbit.yaml` for review profile, path-scoped instructions, and auto-review setup.

Setup path:

1. Install the GitHub App: https://github.com/apps/coderabbitai
2. Grant access to this repository.
3. Open a PR — review runs automatically on commits to non-draft PRs targeting `main`.

No SDK or runtime integration is added; CodeRabbit operates entirely via the GitHub App.

## Known gotchas

- `routeTree.gen.ts` is generated by `@tanstack/router-plugin` during `vite dev` / `vite build`. After adding a route, run a build (or start the dev server) before typechecking, or `tsc` will fail with "Cannot find module './routeTree.gen'".
- The in-memory store resets on Worker isolate eviction. Do not treat it as durable storage.
- Cloudflare Workers do not provide Node's `fs` / `child_process`. Keep server functions Workers-compatible.
- Search params on `/products` use `(prev) => ({ ... })` reducers; the parent route inference can be loose — explicit `from: Route.fullPath` on `useNavigate` keeps types tight.

## Next steps

- Swap in-memory store for Cloudflare D1 + migrations.
- Add session auth (TanStack Start middleware + `__Host-` cookie) before exposing publicly.
- Add CSV import/export for bulk product loads.
- Per-location stock (currently a single `stock` field on the product).
- Soft-delete + restore for products.
