# Pre-PR review

Check your own diff against this list before opening a pull request. Every item is a mistake review has caught in this repo more than once: catching it here costs a minute, in review a round trip, in production an incident.

It doesn't replace the formatters, linters, type checks and tests. Run `bun run qa` first; this is the correctness pass on top.

**How to use it:** read your diff, then work through "Always" plus the sections matching what you touched. When a check turns up something deliberate, it probably belongs in [KNOWN_NON_ISSUES.md](./KNOWN_NON_ISSUES.md).

## Always

- **The diff contains only this change.** No drive-by reformatting, unrelated files or reordered imports in files you didn't otherwise edit.
- **Every consumer of what you changed is updated in the same PR.** Interfaces, config keys, exports, payloads, and the ones the compiler won't catch: test mocks, fixtures and fakes.
- **Docs that describe what you changed are updated in the same PR.** After a rename, search the Markdown files too.

## When the diff touches Cloudflare, caching, middleware, headers or bindings

- **The change was verified with `bun run preview`, not only `bun run dev`.** `next dev` runs on Node; production runs on `workerd`, and some failures only show there (see [FOOTGUNS.md](./FOOTGUNS.md)).
- **A change to `wrangler.jsonc` comes with a regenerated `cloudflare-env.d.ts`.** Run `bun run cf-typegen` and commit the result, or the binding types drift from the config.
