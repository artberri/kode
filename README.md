# KODE

KODE is the code behind [kode.eus](https://kode.eus), a set of small web tools in Basque. It will offer three products:

- **QR code generator** (available): it runs entirely in your browser, with no sign-up, no database and no stored data.
- **URL shortener** (planned).
- **Bio page builder** (planned).

The site is in Basque only for now.

## Tech stack

- [Next.js](https://nextjs.org) with React and TypeScript, styled with Tailwind CSS.
- Deployed to [Cloudflare Workers](https://workers.cloudflare.com) through [OpenNext](https://opennext.js.org/cloudflare).
- [Bun](https://bun.sh) for packages and scripts, [Node.js](https://nodejs.org) to run Next.js and Wrangler.
- [oxlint](https://oxc.rs) and [oxfmt](https://oxc.rs) for linting and formatting, [Vitest](https://vitest.dev) for tests.

## Running it locally

### Requirements

The Node.js and Bun versions are pinned in `.prototools`. The easiest way to get them is [proto](https://moonrepo.dev/proto):

```sh
proto use
```

Without proto, install the Node.js and Bun versions listed in `.prototools` yourself.

### Set up

```sh
git clone https://github.com/artberri/kode.git
cd kode
bun install
```

`bun install` also points Git at the hooks in `.githooks/`, which format staged files and check commit messages.

### Develop

```sh
bun run dev
```

Then open <http://localhost:3000>.

To build and serve the real Cloudflare Worker locally, which is what production runs, use:

```sh
bun run preview
```

### Check your changes

| Command              | What it does                                 |
| -------------------- | -------------------------------------------- |
| `bun run qa`         | Lint, type check and run the tests: the gate |
| `bun run test`       | Run the tests once                           |
| `bun run test:watch` | Run the tests in watch mode                  |
| `bun run lint`       | Lint with type-aware rules                   |
| `bun run typecheck`  | Type check                                   |
| `bun run format`     | Format the code                              |

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org).

## Contributing

Contributions are welcome: [CONTRIBUTING.md](CONTRIBUTING.md) explains how to set up, check and send a change. Everyone taking part follows the [code of conduct](CODE_OF_CONDUCT.md).

## License

Copyright (C) 2026 Alberto Varela Sánchez

KODE is free software: you can redistribute it and/or modify it under the terms of the [GNU Affero General Public License](LICENSE) as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

In short: you may use, study, change and share this code. If you distribute a modified version, or run one as a service that other people use over a network, you must publish its full source code under the same license.

The fonts are not covered by the AGPL: they are under the SIL Open Font License, and [ASSETS.md](ASSETS.md) lists every font, image and drawing in the repository with its source and license.

KODE is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the [license](LICENSE) for details.

### Name and brand

The license covers the code, not the brand. The KODE name, the logo and the visual identity of kode.eus are not licensed for reuse. If you run your own version, give it a different name and look.
