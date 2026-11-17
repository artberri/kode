KODE (domain kode.eus) is a Next.js 16 App Router app in TypeScript 7 with Tailwind, deployed to Cloudflare Workers through OpenNext, so production code runs on `workerd`, not Node. It will host a QR code generator, a URL shortener and a bio page builder; only the QR code generator exists so far, and it runs entirely in the browser with no login, database or stored user data. oxfmt owns formatting and oxlint (type-aware, warnings as errors) plus strict `tsc` own lint and type errors, so leave style and anything those tools catch to them.

Before raising any finding, read these files:

- docs/KNOWN_NON_ISSUES.md: settled conventions. A finding that matches an entry there is not a defect; do not raise it.
- docs/PRE_PR_REVIEW.md: the defect types this repo prioritises. The "Always" list applies to every change.

Check these against the diff: scan their headings and read only the entries for areas the change touches.

- docs/FOOTGUNS.md: runtime pitfalls that pass review and type checks.

Conventions from AGENTS.md that look like defects to an outside reviewer but are deliberate: Node and Bun both pinned (Bun for packages and scripts, Node for the Next.js, OpenNext and Wrangler CLIs); `cacheComponents` off and no incremental cache configured; a committed, generated `cloudflare-env.d.ts`; a Next.js-generated block in AGENTS.md.
