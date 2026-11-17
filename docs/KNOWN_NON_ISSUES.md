# Known non-issues

Reviewers, human and automated, keep flagging some patterns in this repo that are deliberate. Each entry here records one of them and why it is fine, so the next review doesn't raise it and nobody "fixes" it.

Read this file in two situations:

1. **Before acting on a review comment** that matches an entry: the answer is a reply on the thread, not a commit.
2. **Before writing code** in one of these areas, so you match the convention the first time.

Add an entry when a finding is rejected with a reason that will hold next time. If you disagree with an entry, change the convention deliberately and update the entry; don't fork it in one file.

## Toolchain

**Both Node and Bun are pinned in `.prototools`.** Bun installs packages and runs scripts; Node runs Next.js, OpenNext and Wrangler, which are Node CLIs. Dropping Node would leave those tools on whatever Node the machine has, or on Bun's runtime, which they don't support. Settled in `AGENTS.md`.

**The `prepare` script ends with `|| true`.** It points `core.hooksPath` at `.githooks` on `bun install`, and skips that where there is no git repository, such as a CI build from a tarball, instead of failing the install. Settled in commit `7172108`.

## Linting and types

**`typescript/prefer-readonly-parameter-types` is off in `.oxlintrc.json`.** React props and `ReactNode` can't be deeply readonly, so the rule fires on every component. Keep it off rather than adding disable comments.

## Cloudflare and Next.js

**`cloudflare-env.d.ts` is a committed generated file.** Cloudflare recommends committing it so type checks work straight after a clone. Regenerate it with `bun run cf-typegen` after editing `wrangler.jsonc`; never edit it by hand. Settled in commit `0a09ccd`.

**`open-next.config.ts` configures no incremental cache.** Every page is static for now, so there is nothing to cache or revalidate. Add the R2 cache with the first page that needs ISR or revalidation.

**`next.config.ts` calls `void initOpenNextCloudflareForDev()`.** OpenNext requires this call so `getCloudflareContext()` returns bindings under `next dev`; the `void` intentionally discards its promise, as nothing waits on it.

## Agent docs

**`AGENTS.md` contains a Next.js-generated block between `nextjs-agent-rules` markers.** `next dev` adds it back whenever it is missing, so it is committed on purpose; removing it only produces an uncommitted change on the next run.
