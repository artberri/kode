# Contributing to KODE

Help is welcome and much appreciated, whether you are an experienced developer or about to send your first pull request. Have a look at the [open issues](https://github.com/artberri/kode/issues), and please follow the [code of conduct](CODE_OF_CONDUCT.md).

KODE is the code behind [kode.eus](https://kode.eus): a QR code generator that runs entirely in the browser, with a URL shortener and a bio page builder planned. This file covers how to set it up, run it while you change it, and send a change.

For anything bigger than a small fix, open an issue first and say what you'd like to change, so we can agree on the shape before you spend time on it.

## Setting up

You need **Node.js** and **Bun**, the versions pinned in [`.prototools`](.prototools): with [proto](https://moonrepo.dev/proto), `proto use` installs both. Bun installs packages and runs the scripts; Node runs Next.js and Wrangler.

1. Fork the repository, and clone your fork:

    ```sh
    git clone https://github.com/YOUR_USERNAME/kode.git
    cd kode
    ```

2. Install the dependencies:

    ```sh
    bun install --frozen-lockfile
    ```

    This also points Git at the hooks in [`.githooks/`](.githooks): `pre-commit` formats the files you stage, and `commit-msg` checks the commit message.

Keep `bun.lock` as the only lockfile: add packages with `bun add`, never with npm, pnpm or yarn.

## Running it while you work

```sh
bun run dev
```

Then open <http://localhost:3000>. It reloads as you save.

Production runs on Cloudflare Workers (`workerd`), not Node. Anything that touches caching, middleware, headers or Cloudflare bindings behaves differently there, so check it with the real Worker, built and served locally:

```sh
bun run preview
```

## The language of the site

The site is in **Basque only** for now. Every text a visitor can see or hear is in Basque: labels, messages, errors, metadata and `alt` text. Code, comments, commit messages and these docs are in English.

## Where things are

The code is organised as ports and adapters in vertical slices, one per product:

```
src/app/                  Next.js routes: thin, they wire a slice's use cases to its adapters
src/shared/               the only code slices share (shared UI in src/shared/ui/)
src/qr-code/              the QR code generator slice
  domain/                 pure rules and values: no framework, no I/O
  application/            use cases, and the ports (interfaces) they need
  infrastructure/         adapters: UI components (ui/), browser APIs, libraries, and in-memory fakes
public/                   static files: icons, the font the QR frames are drawn with
docs/                     review notes and runtime traps
.agents/plans/            implementation plans; finished ones in done/
```

Slices stay independent: inside a slice, import with relative paths; across slices, only `@/shared`. The linter enforces the layers.

[AGENTS.md](AGENTS.md) has more on the architecture, the toolchain and the conventions; it is also what an AI agent working in the repo reads first. Before you change code in an area, skim [docs/KNOWN_NON_ISSUES.md](docs/KNOWN_NON_ISSUES.md) (deliberate patterns that look like bugs) and [docs/FOOTGUNS.md](docs/FOOTGUNS.md) (runtime traps that pass review).

## Checks

Run this before you send a change:

```sh
bun run qa   # lint (type-aware), type check, tests
```

It has to pass with zero warnings. Formatting is done for you by the `pre-commit` hook; `bun run format` formats everything by hand.

## Tests

Tests use [Vitest](https://vitest.dev), written outside in:

- **An acceptance test per use case**, first: `<use-case>.acceptance.test.ts` next to it. It drives the use case through its input, with hand-written in-memory fakes from the slice's `infrastructure/` in place of anything slow or unrunnable. Prefer a fake to a mock.
- **Unit tests** where an inner piece deserves its own: `<name>.test.ts` next to it, pure where possible.
- **Component tests** for UI with real logic: `<component>.test.tsx`, with Testing Library in `happy-dom`. Query by role and label, as a user would.
- When an adapter has a fake, both share one contract test suite (`*.contract.test.ts`), so the fake can't drift from the real thing.
- Fixing a bug, start with a test that fails because it reproduces the bug, then fix it and watch the test pass.

`bun run test:watch` keeps the tests running while you work.

## Code style

- TypeScript, strictly typed, no `any`.
- Tabs for indentation, spaces only in YAML. oxfmt formats; don't fight it.
- A lint rule is satisfied by fixing the code. If you must disable one, say why in the same comment.
- Comments explain why, not what, in full sentences.

## Fonts, images and other assets

Every font, image and drawing has a row in [ASSETS.md](ASSETS.md) with its source and license. A pull request that adds or replaces an asset adds its row. Fonts are self-hosted files under the SIL Open Font License, committed with their license text; the site never loads anything from the Google Fonts CDN.

## Commits and pull requests

- Small commits, one topic each, with [Conventional Commits](https://www.conventionalcommits.org) subjects: `feat(qr-code): …`, `fix: …`, `docs: …`, `test: …`, `build: …`. Body lines are 100 characters or fewer; the `commit-msg` hook checks both.
- A pull request says what changed, why, and how you checked it: the tests you added and, for anything visible, what you looked at in the browser (a screenshot helps).
- Keep `bun run qa` green in every commit.
- Never commit secrets, tokens, local paths or anything personal; check the diff before you push.

## Plans

Changes of more than one step are planned in `.agents/plans/` before they are built: the behaviour as rules a test or a look can check, the decisions with their reasons, and phases that each end in something visible. The `create-plan` and `execute-plan` skills in `.agents/skills/` do this with Claude Code; you can write a plan by hand in the same shape, or skip it for a small fix.

## License

KODE is under the [GNU Affero General Public License, version 3 or later](LICENSE); by contributing you agree your work is licensed the same way. The fonts keep their own license (see [ASSETS.md](ASSETS.md)), and the KODE name and brand are not licensed for reuse (see the [README](README.md#name-and-brand)).
