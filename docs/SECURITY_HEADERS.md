# Security headers

`next.config.ts` sends three headers with every page: a Content Security Policy (CSP), `Referrer-Policy` and `Permissions-Policy`. HTTPS, HSTS and the minimum TLS version are zone settings in Cloudflare, recorded in [DEPLOYMENT.md](DEPLOYMENT.md).

The CSP is an allow-list of what the pages load today, and nothing more. It goes stale the moment a page loads something it doesn't list, so it is reviewed as part of the change that does that (see [When to review it](#when-to-review-it)).

## The policy

| Directive         | Value                    | Why                                                                                                                                   |
| ----------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `default-src`     | `'self'`                 | Anything not listed below comes from this origin only.                                                                                |
| `script-src`      | `'self' 'unsafe-inline'` | Next.js hydrates with inline scripts; see the trade-off below. `'unsafe-eval'` is added under `next dev` only, for React's debugging. |
| `style-src`       | `'self'`                 | Tailwind compiles to a stylesheet; no inline styles.                                                                                  |
| `img-src`         | `'self' data: blob:`     | `data:` for the sample QR code on the home page, `blob:` to rasterise and download exports.                                           |
| `font-src`        | `'self'`                 | Fonts are self-hosted (see [ASSETS.md](../ASSETS.md)).                                                                                |
| `connect-src`     | `'self'`                 | The frame text outliner fetches its font from `/fonts/`.                                                                              |
| `object-src`      | `'none'`                 | No plugins.                                                                                                                           |
| `base-uri`        | `'none'`                 | No `<base>` element, so it can't be injected to redirect relative URLs.                                                               |
| `form-action`     | `'self'`                 | No form posts elsewhere.                                                                                                              |
| `frame-ancestors` | `'none'`                 | No page may be framed, which prevents clickjacking.                                                                                   |

`Referrer-Policy: strict-origin-when-cross-origin` sends only the origin to other sites. `Permissions-Policy` turns off the camera, microphone, geolocation and the Topics API, which no page uses.

### The trade-off: `'unsafe-inline'` scripts

A strict CSP would allow inline scripts only with a per-request nonce. Next.js can add one, through a `proxy.ts`, but only to dynamically rendered pages: every page would then render on each request, losing the prerendered HTML and spending Worker CPU on every visit (the free plan allows 10 ms per request).

That cost buys little while the site serves no user content: there is no stored data, no login, and the only HTML injected (`qr-preview.tsx`) is an SVG the app generates itself. So the policy keeps `'unsafe-inline'` and still blocks every other origin, framing, plugins and `<base>` hijacking. This changes when users can put content on a page (see below).

## When to review it

Review the policy, and this file, in the same change as any of these:

- **A page loads something new**: a third-party script, analytics, an embed, a font, an image or an API on another origin, or a new kind of URL (`data:`, `blob:`, a worker). Add the narrowest source that works, to the narrowest directive, and add or update its row above.
- **A page serves user content**: anything a visitor wrote or uploaded and other visitors see, such as the planned bio pages (text, links, avatars) or short-link previews. Before it ships, move those pages to a nonce-based CSP (`script-src 'self' 'nonce-…' 'strict-dynamic'`) and decide where user images may come from. The `unsafe-inline` trade-off above no longer holds there.
- **A new route needs different rules**, for example an API route or an embeddable widget that other sites must frame. Give it its own `headers()` entry rather than loosening the site-wide one.

Never fix a violation by adding `*`, `https:` or `'unsafe-eval'` to production.

## Checking a change

`next dev` adds `'unsafe-eval'`, so check on the real Worker:

1. Run `bun run preview` and open the page with the browser console showing.
2. Go through every flow the change touches. A blocked resource logs "Refused to … because it violates the following Content Security Policy directive".
3. After the deploy, `curl -sI https://kode.eus/` shows the headers production sends.
