# KODE

KODE (`kode` package, domain `kode.eus`) will host three products: a QR code generator, a URL shortener and a bio page builder. Only the **QR code generator** is in scope now: it runs entirely in the browser, with no login, database or stored data. Keep the code ready for the other two (routes, shared UI) without building them yet.

## Toolchain

- proto pins Node and Bun in `.prototools`. Bun installs packages and runs scripts (`bun add`, `bun run <script>`); Node runs Next.js, OpenNext and Wrangler, which are Node CLIs. Keep `bun.lock` as the only lockfile.
- `bun run check` (format, lint, type check) is the gate: a change is done when it passes with zero warnings.
- Format with `bun run format` rather than by hand. Indentation comes from `.editorconfig` (tabs; spaces only for YAML), which oxfmt reads.

## Linting and types

- oxlint runs type-aware rules (`oxlint-tsgolint`) and treats warnings as errors; TypeScript is strict, including `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Fix the code to satisfy a rule; a disable comment needs a reason next to it.
- `typescript/prefer-readonly-parameter-types` is off: React props and `ReactNode` can't be deeply readonly.
- `lint` and `typecheck` run `next typegen` first, so route types such as `LayoutProps` and `PageProps` exist.

## Cloudflare

The app deploys to Cloudflare Workers through OpenNext (`@opennextjs/cloudflare`), so production runs on `workerd`, not Node.

- `bun run dev` is the fast loop; `bun run preview` builds and serves the real Worker locally. Verify on `preview` anything touching caching, middleware, headers or bindings.
- Leave `cacheComponents` off in `next.config.ts`: with it on, OpenNext 1.20 builds fine but every request hangs on `workerd`. Re-test with `preview` before enabling it after an OpenNext upgrade.
- Read bindings through `getCloudflareContext()`. After editing `wrangler.jsonc`, run `bun run cf-typegen` to refresh `cloudflare-env.d.ts`.
- No incremental cache is configured (`open-next.config.ts`). Add the R2 cache when a page needs ISR or revalidation.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
