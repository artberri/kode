# Pre-PR review

Check your own diff against this list before opening a pull request. Every item is a mistake review has caught in this repo more than once: catching it here costs a minute, in review a round trip, in production an incident.

It doesn't replace the formatters, linters, type checks and tests. Run `bun run qa` first; this is the correctness pass on top.

**How to use it:** read your diff, then work through "Always" plus the sections matching what you touched. When a check turns up something deliberate, it probably belongs in [KNOWN_NON_ISSUES.md](./KNOWN_NON_ISSUES.md).

## Always

- **The diff contains only this change.** No drive-by reformatting, unrelated files or reordered imports in files you didn't otherwise edit.
- **Every consumer of what you changed is updated in the same PR.** Interfaces, config keys, exports, payloads, and the ones the compiler won't catch: test mocks, fixtures and fakes.
- **Docs that describe what you changed are updated in the same PR.** After a rename, search the Markdown files too.

## When the diff adds or changes a use case

- **The use case has an acceptance test that drives it through its input.** Expensive or unrunnable adapters are replaced by in-memory fakes from the slice's `infrastructure/`, not by mocks of the use case's own collaborators.
- **No relative import climbs into another slice.** oxlint only catches `@/` aliases; a path like `../../short-links/...` from inside a slice gets past it. Cross-slice code goes through `@/shared`.
- **A new port is named for what the use case needs, and has a fake.** A port named after a technology (`D1LinkStore`) belongs in `infrastructure/` as an adapter, not in `application/`.

## When the diff touches Cloudflare, caching, middleware, headers or bindings

- **The change was verified with `bun run preview`, not only `bun run dev`.** `next dev` runs on Node; production runs on `workerd`, and some failures only show there (see [FOOTGUNS.md](./FOOTGUNS.md)).
- **The Content Security Policy still matches what the pages load.** A page that loads something new (a script, style, font, image or connection, or anything from another origin), or that shows user content, updates the policy in `next.config.ts` and [SECURITY_HEADERS.md](./SECURITY_HEADERS.md) in the same PR, and was checked on `bun run preview` with the console open for "Refused to …" errors. User content also means moving those pages to a nonce.
- **A change to `wrangler.jsonc` comes with a regenerated `cloudflare-env.d.ts`.** Run `bun run cf-typegen` and commit the result, or the binding types drift from the config.
