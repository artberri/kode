# KODE

KODE (`kode` package, domain `kode.eus`) will host three products: a QR code generator, a URL shortener and a bio page builder. Only the **QR code generator** is in scope now: it runs entirely in the browser, with no login, database or stored data. Keep the code ready for the other two (routes, shared UI) without building them yet.

The site is in **Basque only** for now: write all user-facing text in Basque, including metadata, error messages and `alt` text. The root layout declares `lang="eu"`.

## Toolchain

- proto pins Node and Bun in `.prototools`. Bun installs packages and runs scripts (`bun add`, `bun run <script>`); Node runs Next.js, OpenNext and Wrangler, which are Node CLIs. Keep `bun.lock` as the only lockfile.
- `bun run qa` (lint, type check, tests) is the gate: a change is done when it passes with zero warnings. Formatting is left to the `pre-commit` hook.
- Format with `bun run format` rather than by hand. Indentation comes from `.editorconfig` (tabs; spaces only for YAML), which oxfmt reads.
- Claude Code's TypeScript language server is the project plugin in `.claude/marketplace/`, which runs TypeScript 7's built-in `tsc --lsp`. TypeScript 7 ships no `tsserver.js`, so `.claude/settings.json` turns off the official `typescript-lsp` plugin (built on `typescript-language-server`) for this project.
- Git hooks live in `.githooks/`; `bun install` points `core.hooksPath` at them. `pre-commit` formats staged files and `commit-msg` runs commitlint, so commit messages follow Conventional Commits with body lines of 100 characters or fewer.

## Linting and types

- oxlint runs type-aware rules (`oxlint-tsgolint`) and treats warnings as errors; TypeScript is strict, including `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes`. Fix the code to satisfy a rule; a disable comment needs a reason next to it.
- `typescript/prefer-readonly-parameter-types` is off: React props and `ReactNode` can't be deeply readonly.
- `lint` and `typecheck` run `next typegen` first, so route types such as `LayoutProps` and `PageProps` exist.

## Architecture

Ports and adapters, organised in vertical slices, one per product:

```
src/
├── app/                 # Next.js routes: thin, they wire a slice's use cases to its adapters
├── shared/              # the only code slices share; keep it small, and it imports no slice
└── <slice>/             # qr-code, short-links, bio-pages
    ├── domain/          # pure: entities, value objects, rules; no framework, no I/O
    ├── application/     # use cases and the ports (interfaces) they need; imports only domain
    └── infrastructure/  # adapters: UI components (`ui/`), storage, external services, and their in-memory fakes
```

- Slices stay independent: inside a slice, import with relative paths; across slices, only `@/shared` is allowed. oxlint enforces the layers and the `@/` aliases (`no-restricted-imports` overrides in `.oxlintrc.json`); it can't see a relative path that climbs into another slice, so review catches that.
- A port lives in `application/` and is named for what the use case needs (`QrCodeRenderer`, `LinkStore`), not for the technology behind it.

## Testing

Outside-in TDD with Vitest (`bun run test`, `bun run test:watch`):

1. **Acceptance test per use case**, first: `<use-case>.acceptance.test.ts` next to the use case. It drives the use case through its input and replaces expensive or unrunnable adapters (database, network) with hand-written in-memory fakes from the slice's `infrastructure/`. Prefer a fake to a mock.
2. **Unit tests** where an inner piece deserves its own: `<name>.test.ts` next to it, pure where possible; `vi.fn()` only when a collaborator can't be faked.
3. **Component tests** for UI with real logic: `<component>.test.tsx`, with Testing Library in `happy-dom` (`vitest.setup.dom.ts` adds the jest-dom matchers). Query by role and label, as a user would.

Vitest runs `.test.ts` files in Node and `.test.tsx` files in `happy-dom` (`vitest.config.mts`). Test files may import `infrastructure/` to wire fakes; the layer rules don't apply to them, but the slice rule does. When a port gets a real adapter, give the fake and the real adapter one shared contract test suite, so the fake can't drift.

## Cloudflare

The app deploys to Cloudflare Workers through OpenNext (`@opennextjs/cloudflare`), so production runs on `workerd`, not Node.

- `bun run dev` is the fast loop; `bun run preview` builds and serves the real Worker locally. Verify on `preview` anything touching caching, middleware, headers or bindings.
- Leave `cacheComponents` off in `next.config.ts`: see [FOOTGUNS.md](docs/FOOTGUNS.md).
- Read bindings through `getCloudflareContext()`. After editing `wrangler.jsonc`, run `bun run cf-typegen` to refresh `cloudflare-env.d.ts`, with no `.open-next/` on disk: see [FOOTGUNS.md](docs/FOOTGUNS.md).
- No incremental cache is configured (`open-next.config.ts`). Add the R2 cache when a page needs ISR or revalidation.
- `next.config.ts` sends a Content Security Policy that allows only what the pages load today. Read [SECURITY_HEADERS.md](docs/SECURITY_HEADERS.md) and update the policy in the same change whenever a page loads something new (script, style, font, image, connection, another origin) or serves user content.
- Every push to `main` deploys to production once QA passes, so `main` is always live. Infrastructure is `wrangler.jsonc` only; the dashboard-side setup (token, secrets, `www` redirect) is in [DEPLOYMENT.md](docs/DEPLOYMENT.md): read it before touching the domain, the deploy job or the zone. To commit and push, use the `ship` skill, so QA and the local review run before a push goes live.

## Design

The design lives in two Claude Design artifacts. Read them with the Artifact tool (`action: "read"`, by file `path`), never by fetching the URL.

- **Design system** (<https://claude.ai/artifact/F6S7WRQ3iMjcHHgbProwWe>): the tokens, the brand book, and every UI component with its variants. It is the source of truth for how the UI looks. Before building or changing UI, read its `project/README.md` and the `project/components/<Component>/README.md` of each component you touch. Shared components live in `src/shared/ui/` under the same names, and the tokens in the `@theme` of `src/app/globals.css`. Build a component only when a feature needs it.
- **Keep the two in step:** when code adds or changes a token or a shared component, update the artifact in the same piece of work (`tokens.json`, the component's `README.md` and `preview.html`, and `components/bundle.js`, `bundle.css` and `index.d.ts`), and say so in your summary.
- **Page designs** (<https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA>): a canvas of artboards. `AltLauburuGoxoa.dc.html` ("✓ A2") is the approved home page; the other artboards are discarded explorations.

## Assets

[`ASSETS.md`](ASSETS.md) gives every font, image and drawing a row with its source and license: add the row in the same change that adds or replaces an asset, and read its font rules before touching a font. Fonts are self-hosted OFL files, committed and loaded with `next/font/local`.

## Review docs

- [`docs/KNOWN_NON_ISSUES.md`](docs/KNOWN_NON_ISSUES.md): deliberate patterns that look like defects. Read it before acting on a review comment, and before writing code in an area it covers.
- [`docs/PRE_PR_REVIEW.md`](docs/PRE_PR_REVIEW.md): check your diff against it before opening a pull request.
- [`docs/FOOTGUNS.md`](docs/FOOTGUNS.md): runtime traps that pass review and type checks. Scan its headings when a change touches the same areas.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
