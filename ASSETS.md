# Assets

Every font, image and drawing in this repository, with its source and license. No asset lands without a row here: unclear provenance can't be fixed later.

## The code is AGPL, the assets carry their own license

KODE's code is licensed under the [AGPL-3.0-or-later](LICENSE). The fonts are not: each is under the SIL Open Font License 1.1, with its license text next to the file. The drawings made for KODE are covered by the AGPL along with the code.

The license covers files, not the brand: the KODE name, the logo and the visual identity of kode.eus are not licensed for reuse (see the [README](README.md#name-and-brand)). If you run your own version, replace the icons and give it a different name and look.

## Fonts: self-hosted, OFL only

- Every font is licensed under the [SIL Open Font License](https://openfontlicense.org) and committed to this repository, with its license text alongside.
- Never load a font from the Google Fonts CDN, at runtime or at build time: `next/font/google` included. Runtime requests expose every visitor's IP address to Google, which German courts have found to breach the GDPR; build-time downloads make the build depend on Google. Page fonts load through `next/font/local`; the QR frame renderer fetches its font from `public/fonts/`.
- Take fonts from [Fontsource](https://fontsource.org), which packages the Google Fonts catalogue with its licenses, and record the package and version in the table.

| File                                              | Source                                                                                                                 | Author                        | License                                         | Used for                     |
| ------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------- | ----------------------------------------------- | ---------------------------- |
| `src/app/fonts/unbounded-latin-wght-normal.woff2` | Fontsource `@fontsource-variable/unbounded` 5.3.0, Latin subset, weights 200–900                                       | The Unbounded Project Authors | SIL OFL 1.1 (`src/app/fonts/OFL-unbounded.txt`) | Page headings and wordmark   |
| `src/app/fonts/dm-sans-latin-wght-normal.woff2`   | Fontsource `@fontsource-variable/dm-sans` 5.3.0, Latin subset, weights 100–1000                                        | The DM Sans Project Authors   | SIL OFL 1.1 (`src/app/fonts/OFL-dm-sans.txt`)   | Page body text               |
| `public/fonts/unbounded-800-latin.ttf`            | Google Fonts, Unbounded 800, Latin subset, as TrueType (`opentype.js` can't read WOFF2); downloaded once and committed | The Unbounded Project Authors | SIL OFL 1.1 (`public/fonts/OFL.txt`)            | Text outlined into QR frames |

## Images and drawings

| File                                                                                                                      | Source                                                                  | Author | License                               |
| ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ------ | ------------------------------------- |
| `public/icon.svg`                                                                                                         | The KODE mark from the design system's `kode-mark.svg`                  | KODE   | AGPL, with the code; brand, see above |
| `public/favicon.ico`, `public/apple-touch-icon.png`, `public/icon-192.png`, `public/icon-512.png`, `public/icon-mask.png` | Rendered from the design system's `kode-mark.svg` with `rsvg-convert`   | KODE   | AGPL, with the code; brand, see above |
| `src/qr-code/domain/qr-frames.ts`                                                                                         | Path data of the QR frames, drawn for KODE                              | KODE   | AGPL, with the code                   |
| `src/qr-code/infrastructure/ui/design-tiles.tsx`                                                                          | Inline SVG previews of the dot, finder and frame styles, drawn for KODE | KODE   | AGPL, with the code                   |
