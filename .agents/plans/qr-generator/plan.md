# Plan: QR code generator

## Goal

Ship the first version of kode.eus: a landing page with a QR code generator that runs entirely in the browser. People paste a link, choose a frame, shapes and colours, and download a scannable code as PNG, SVG or WebP, with no account and nothing leaving their device. Along the way, the shared UI components of the KODE design system are built as the generator needs them.

## Behaviour

- **B1.** A valid http or https link produces a QR code that decodes to exactly the normalised link. — _proved by:_ `src/qr-code/infrastructure/qr-matrix-encoder.contract.test.ts` › QrcodeGeneratorEncoder encodes %s so a reader decodes it back
- **B2.** A link typed without a scheme (`kode.eus/menua`) gets `https://` added; the helper text says so and shows the full link. — _proved by:_ `src/qr-code/domain/parse-link.test.ts` › adds https:// to a link typed without a scheme; `src/qr-code/infrastructure/ui/qr-generator.test.tsx` › says https:// was added and names the preview with the full link
- **B3.** Any of these shows a Basque error under the field, dims the preview and disables the download button: a scheme other than http or https, a host without a dot, a link with spaces, or a link longer than 1000 characters. — _proved by:_ `src/qr-code/domain/parse-link.test.ts` › rejects a scheme other than http or https, rejects a host without a dot, rejects a link with spaces, rejects a link longer than 1000 characters; `src/qr-code/infrastructure/ui/qr-generator.test.tsx` › announces an error for a scheme other than http or https, waits until the field is left before calling a half-typed host wrong
- **B4.** An empty field shows a neutral prompt, not an error, and the download stays disabled. — _proved by:_ `src/qr-code/application/design-qr-code.acceptance.test.ts` › waits for a link while the field is empty, without encoding anything; `src/qr-code/infrastructure/ui/qr-generator.test.tsx` › prompts for a link while the field is empty, without an error
- **B5.** Changing the frame, dot shape, corner frame shape, corner centre shape, any colour or the frame text updates the preview at once. — _proved by:_ `src/qr-code/domain/render-qr-svg.test.ts` › dots, finder patterns, colours; `src/qr-code/infrastructure/ui/qr-generator.test.tsx` › redraws the preview when $group is set to $option, sets the four colours from a palette and selects it
- **B6.** The frame text accepts at most 16 characters. With "Markorik ez" (no frame) the text field and the frame and text colour pickers are disabled, not hidden, with a line saying why, and the code has no label. — _proved by:_ `src/qr-code/domain/render-qr-svg.test.ts` › cuts the text to 16 characters, draws no text without a frame; `src/qr-code/infrastructure/ui/qr-generator.test.tsx` › cuts the frame text at 16 characters and counts them, disables the frame text without a frame, says why, and draws no label, disables the frame and text colours without a frame, and says why
- **B7.** A warning appears when the QR colour is lighter than the background or their contrast is below 3:1, and disappears once neither holds. — _proved by:_ `src/qr-code/domain/contrast.test.ts` › is low below 3:1, is inverted when the QR is lighter than the background; `src/qr-code/infrastructure/ui/qr-generator.test.tsx` › warns when the QR is lighter than its background, warns when the QR and its background are too alike, until they are not
- **B8.** Choosing a palette preset sets the QR, background, frame and frame-text colours; changing any of those colours afterwards leaves no preset selected. — _proved by:_ `src/qr-code/domain/palette-presets.test.ts` › finds $name from its own four colours, matches none once any one colour differs; `src/qr-code/infrastructure/ui/qr-generator.test.tsx` › sets the four colours from a palette and selects it, leaves no palette selected once a colour is changed by hand
- **B9.** Every code keeps at least four modules of quiet zone between the modules and the frame or the image edge. — _proved by:_ `src/qr-code/domain/render-qr-svg.test.ts` › keeps four light modules around a $size-module code in the $frame frame
- **B10.** Downloading SVG saves `kode-qr.svg`: the same design as the preview, with the frame text drawn as Unbounded outlines, so it looks the same in any browser, design tool or print shop without the font installed. — _proved by:_ `src/qr-code/application/export-qr-code.acceptance.test.ts` › saves the SVG as kode-qr.svg, with the frame text as outlines; `src/qr-code/domain/render-qr-svg.test.ts` › draws the text on the %s frame as a path in the text colour, at its label slot; `src/qr-code/infrastructure/frame-text-outliner.contract.test.ts` › $name centres the text on the slot, shrinks a long text to the slot's width
- **B11.** Downloading PNG or WebP saves `kode-qr.png` or `kode-qr.webp`, 1024 px on its long side, matching the preview. — _proved by:_ `src/qr-code/application/export-qr-code.acceptance.test.ts` › draws the same outlined SVG at 1024 px and saves kode-qr.%s
- **B12.** Where the browser can't encode WebP, the WebP option is disabled with a Basque explanation; PNG and SVG keep working. — _proved by:_ `src/qr-code/application/export-qr-code.acceptance.test.ts` › saves no WebP where the browser can't encode it
- **B13.** No network request carries the link: generating, previewing and downloading all happen in the browser. — _proved by:_
- **B14.** Every control works from the keyboard and has a Basque accessible name: tabs move with the arrow keys, option, format and swatch choices are radio groups, and the preview's accessible name includes the link. — _proved by:_ `src/shared/ui/url-field.test.tsx` › is a text field named by its visible label; `src/qr-code/infrastructure/ui/qr-generator.test.tsx` › says https:// was added and names the preview with the full link; `src/shared/ui/tabs.test.tsx` › moves and selects with the arrow keys, wrapping at the ends, keeps only the selected tab in the tab order; `src/shared/ui/option-tiles.test.tsx` › is a radio group named by its legend, with the value checked, changes the choice with the arrow keys; `src/shared/ui/swatch-picker.test.tsx` › is a radio group named by its legend, with swatches named by their colour
- **B15.** The home page shows the logo header with no menu, the headline "QR kodeak. Euskaraz. Doan.", the paragraph from the brief, and a "Hasi orain" link that takes people to the generator, with Basque page metadata and the KODE mark as the favicon. — _proved by:_ `src/shared/ui/logo.test.tsx` › links to the home page with the mark and wordmark, named as such

## Context

### Sources

- [brief.md](./brief.md): the request, the decisions taken while planning, and links to everything below.
- [Page designs canvas](https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA): `AltLauburuGoxoa.dc.html` ("✓ A2") is the design to build. `Main.dc.html` is the interactive prototype: its `renderVals()` holds working path builders for the dot shapes, finder shapes and frames, and the URL and contrast rules, worth reading before Phase 1.
- [KODE design system](https://claude.ai/artifact/F6S7WRQ3iMjcHHgbProwWe): `project/tokens.json`, `project/README.md` and `project/components/<Component>/README.md` for each component a phase builds. Its `components/bundle.js` and `bundle.css` are the reference implementation to port.
- [arbela-frame.svg](./arbela-frame.svg): the clipboard frame's exact path data.
- [Next.js fonts](../../../node_modules/next/dist/docs/01-app/01-getting-started/13-fonts.md) and [app icons](../../../node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/app-icons.md): the Next 16 docs to read before Phases 2 and 7.

### Key files

| Area                  | Files                                                                                                                            |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Root layout and page  | [src/app/layout.tsx](../../../src/app/layout.tsx), [src/app/page.tsx](../../../src/app/page.tsx)                                 |
| Tailwind entry        | [src/app/globals.css](../../../src/app/globals.css) (only `@import "tailwindcss";` today)                                        |
| Layer and slice rules | [.oxlintrc.json](../../../.oxlintrc.json) (`no-restricted-imports` overrides per layer)                                          |
| Tests                 | [vitest.config.mts](../../../vitest.config.mts) (`node` and `dom` projects), [vitest.setup.dom.ts](../../../vitest.setup.dom.ts) |
| Scripts               | [package.json](../../../package.json): `test` and `qa` still pass `--passWithNoTests`                                            |
| Conventions           | [AGENTS.md](../../../AGENTS.md) (Architecture, Testing, Design), [docs/KNOWN_NON_ISSUES.md](../../../docs/KNOWN_NON_ISSUES.md)   |

New code goes in the `qr-code` slice (`src/qr-code/{domain,application,infrastructure}`) and in `src/shared/ui/`. Files are kebab-case and export PascalCase components (`src/shared/ui/url-field.tsx` exports `UrlField`), with tests next to them.

### Contracts

- **Page:** `/` (`src/app/page.tsx`), static. The metadata title and description are in Basque, and `src/app/icon.svg` is the KODE mark.
- **Use case `designQrCode`** (`src/qr-code/application/design-qr-code.ts`): input `{ link: string; design: QrDesign }`. It returns one of three states:
    - `{ status: "empty" }`
    - `{ status: "invalid"; reason: "scheme" | "host" | "spaces" | "too-long" }`
    - `{ status: "ready"; link: string; schemeAdded: boolean; svg: string; contrast: "ok" | "low" | "inverted" }`
- **Use case `exportQrCode`** (`src/qr-code/application/export-qr-code.ts`): input `{ link: string; design: QrDesign; format: "png" | "svg" | "webp" }`. It saves one file through `FileSaver`, or answers `"webp-unsupported"`.
- **Ports** (in `src/qr-code/application/`, each with an in-memory fake in `infrastructure/`):
    - `QrMatrixEncoder`: `encode(text): QrMatrix`. The real adapter wraps `qrcode-generator` 2.x, which is `export =` with the `qrcode(typeNumber, errorCorrectionLevel)` factory, `addData`, `make`, `getModuleCount` and `isDark`. It uses type number 0 (automatic) and level `"Q"`. The normalised link is ASCII (`new URL().href`), so the default byte encoding is enough.
    - `ImageRasterizer`: `rasterize(svg, { format, longSide })` returns a `Promise<Blob>`, and `canEncode(format)` returns a `Promise<boolean>`.
    - `FileSaver`: `save({ name, blob })`.
    - `FrameTextOutliner`: `load()` returns `Promise<OutlineFrameText>`, a function that turns the frame text into SVG path data in Unbounded 800, fitted to the frame's label slot. The real adapter loads `opentype.js` and the font on first use.
- **Domain** (`src/qr-code/domain/`), all pure:
    - `QrDesign`: frame, dots, corner, centre, colours `{ qr, background, frame, frameText }` and frameText.
    - `QrMatrix`: a square `readonly (readonly boolean[])[]`.
    - `parseLink`.
    - `renderQrSvg(matrix, design, options?)`: returns the SVG markup string. With `options.outlineFrameText` (Phase 5) the label is a `<path>`; without it, a `<text>` in the page's font.
    - `OutlineFrameText`: `(text, slot) => string`, the type the outliner provides.
    - `contrastOf(qr, background)`.
    - The palette presets.
- **Shared UI** (`src/shared/ui/`): `Logo`, `Icon`, `StepLabel`, `UrlField`, `TicketCard`, `QrSticker`, `Tabs`, `OptionTiles`, `TextField`, `SwatchPicker`, `ColorField`, `Notice`, `SegmentedControl`, `Button`, `Tag`, `Stamp`. The design system's props are the starting point. Tokens go in the `@theme` of `globals.css` under the design system's names (`--color-ink`, `--color-violet`, `--radius-pill`…).
- **Generated outputs people keep:** `kode-qr.svg`, `kode-qr.png` and `kode-qr.webp`. A printed code can't be changed, so B1 and B9 are the contract.
- **Test suites:**
    - acceptance tests for `designQrCode` and `exportQrCode`
    - a contract suite for `QrMatrixEncoder`, run against the fake and `qrcode-generator`, which decodes the matrix back with `jsqr` (dev dependency)
    - component tests for every shared component with behaviour, and for the generator

### Dependencies

None outside this plan. Each phase builds on the previous one.

## Open questions and risks

| #   | Question or risk                                                                                                                                                                                                                                                                                                                                                                                                                                      | Source                                                                                                                                                   | Affects     | Status   |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | -------- |
| 1   | A font embedded as a `data:` URI in an SVG may not be applied when the browser draws that SVG through an `<img>` onto a canvas. A spike (2026-11-17) found Chrome, Firefox (Zen) and Safari 27 all apply it once the font is cached, but a cold Safari drew the canvas straight after `decode()` with no label at all. So the label is drawn as outlines instead: no font loading at draw time in any browser, and the SVG file needs no font either. | Spike                                                                                                                                                    | Phase 5     | Resolved |
| 2   | `happy-dom` has no canvas and no downloads, so `CanvasImageRasterizer` and `BrowserFileSaver` can't run in Vitest and get no contract test. Verify them by hand in Chrome, Firefox and Safari, and scan each downloaded file with a phone.                                                                                                                                                                                                            | Planning                                                                                                                                                 | Phases 5, 6 | Open     |
| 3   | Safari may not encode WebP from a canvas: `toBlob(…, "image/webp")` silently returns a PNG. `canEncode("webp")` must check the blob's `type`, not the browser version.                                                                                                                                                                                                                                                                                | [WebKit bug 226950](https://bugs.webkit.org/show_bug.cgi?id=226950), [caniuse](https://caniuse.com/mdn-api_htmlcanvaselement_toblob_type_parameter_webp) | Phases 5, 6 | Open     |
| 4   | The outlines come from the Latin subset of Unbounded 800 as TrueType (51 KB, from Google Fonts' `css?family=Unbounded:800&subset=latin`; `opentype.js` can't read WOFF2). It is under the SIL Open Font License with no Reserved Font Name, so it can be served as is. Commit `OFL.txt` next to the file.                                                                                                                                             | Planning, spike                                                                                                                                          | Phase 5     | Resolved |
| 5   | The design-system artifact must stay in step with `src/shared/ui`. Each phase that builds a component checks it against the artifact, and updates the artifact once, at the end of the phase, wherever the code ends up different.                                                                                                                                                                                                                    | AGENTS.md, Design                                                                                                                                        | Phases 2–7  | Resolved |
| 6   | Left out on purpose for this version: dark mode, a size picker, a logo inside the code, QR content other than links (Wi-Fi, vCard…), analytics, and an Open Graph image.                                                                                                                                                                                                                                                                              | Brief                                                                                                                                                    | —           | Deferred |
| 7   | The Latin subset has no glyph for characters outside Latin-1 and a few extras (emoji, Cyrillic, CJK). Decided: the outlines leave them out, the outliner lists them (`missing`), and the hint under the frame text field names them, so the preview shows exactly what will be drawn.                                                                                                                                                                 | Spike                                                                                                                                                    | Phases 5, 6 | Resolved |

## Phase 1: Render a QR design to SVG ✅

**Description:** Builds the pure core of the `qr-code` slice and its first use case, with no UI. It comes first because every later phase draws with it, and B1 and B9, the promises a printed code depends on, live here.

**Outside-in TDD checklist:**

- [x] Acceptance test (B1, B2, B3, B4, B9): `designQrCode` with `FixedMatrixEncoder`. It covers empty, invalid (each reason), scheme added, a ready SVG that contains the frame text and colours, and the quiet zone for each frame.
- [x] Unit test (B2, B3): `parseLink`, including trimming, uppercase schemes, `ftp:`, `localhost`, spaces and 1001 characters.
- [x] Unit test (B5, B6, B9): `renderQrSvg` for each dot shape, corner shape, centre shape and frame. Frame text is cut to 16 characters, and "none" has no `<text>`.
- [x] Unit test (B7): `contrastOf` gives `ok`, `low` (below 3:1) and `inverted` (QR lighter than background).
- [x] Contract test (B1): a `QrMatrixEncoder` suite run against `FixedMatrixEncoder` and `QrcodeGeneratorEncoder`. The matrix is square, odd-sized, at least 21, and has the three finder patterns. For the real adapter only, `jsqr` decodes the matrix (drawn to RGBA with a quiet zone) back to the input.

**To-do:**

- [x] `bun add qrcode-generator` and `bun add -d jsqr`.
- [x] Domain: `QrMatrix`, `QrDesign` (with a default design: Zigilua frame, "Eskaneatu", ink QR, violet frame, white background), `parseLink`, `contrastOf`.
- [x] Domain: `renderQrSvg` with the dot shapes (square, round, smooth, diamond), finder shapes (square, rounded, circle) and the five frames. Arbela comes from [arbela-frame.svg](./arbela-frame.svg); the others follow the A2 tile drawings and the prototype's geometry.
- [x] Application: the `QrMatrixEncoder` port and `designQrCode`.
- [x] Infrastructure: `QrcodeGeneratorEncoder` and the `FixedMatrixEncoder` fake.
- [x] Drop `--passWithNoTests` from `test` and `qa` in `package.json`, and delete its entries in `AGENTS.md` (Toolchain) and `docs/KNOWN_NON_ISSUES.md`.

**Verify:**

- [x] The project's checks pass for what this phase touched (see `execute-plan`).
- [x] A one-off script prints the SVG for `https://kode.eus/` in each frame, and a phone scans each one.

## Phase 2: Show the link step and a live preview ✅

> Design: https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA (`AltLauburuGoxoa.dc.html`), design system https://claude.ai/artifact/F6S7WRQ3iMjcHHgbProwWe

**Description:** Puts the generator on the page: the logo header, the ticket card with step 1 (link) and the live preview of the default design. It brings in the design tokens, the fonts and the first shared components. About 15 files, because the tokens and fonts land with their first consumers.

**Outside-in TDD checklist:**

- [x] Component test (B2, B3, B4, B14): `QrGenerator` covers four cases:
    - typing `kode.eus` shows the "https:// added" hint and a preview named with `https://kode.eus/`
    - typing `ftp://x` shows the error, announced as an alert
    - an empty field shows the prompt
    - the preview is an image with the link in its accessible name
- [x] Component test (B3, B14): `UrlField` is labelled. Its error is linked by `aria-describedby`, sets `aria-invalid` and is announced; the `https://` chip is hidden from assistive tech.
- [x] Component test (B15): `Logo` as a link is named "kode, hasiera", and as a mark alone is an image named "kode".

**To-do:**

- [x] Tokens: the design system's colours, radii, border widths and spacing in an `@theme` block in `src/app/globals.css`, with the page background and text colour on `body`.
- [x] Fonts: Unbounded (600–800) and DM Sans (400, 500, 700) through `next/font/google` in `layout.tsx`, exposed as `--font-display` and `--font-body`.
- [x] Shared UI: `Logo`, `Icon` (the six icons), `StepLabel`, `UrlField`, `TicketCard`.
- [x] Slice UI (`src/qr-code/infrastructure/ui/`): `QrGenerator` (client component) with step 1 and the preview of the default design. It wires `designQrCode` to `QrcodeGeneratorEncoder` and renders the SVG string as is on the peach side, about 250 px wide, so the preview is exactly the file people download (no `QrSticker` around it: that would draw a second frame and label). When the link isn't valid, the preview shows `https://kode.eus/` dimmed.
- [x] `page.tsx`: the header with `Logo` (no menu) and the generator section (`id="sortzailea"`).
- [x] Check each component against its design-system README; update the artifact where the code differs.

**Verify:**

- [x] The project's checks pass for what this phase touched (see `execute-plan`).
- [x] On `bun run dev`, typing a link updates the preview, and the page matches A2's generator at desktop and phone widths.

## Phase 3: Add the frame and shape controls ✅

> Design: https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA (`AltLauburuGoxoa.dc.html`; `Main.dc.html` for the Forma tab's layout)

**Description:** Step 2's first two tabs: "Markoa" (frame and frame text) and "Forma" (dots, corner frame, corner centre). It adds the tab and choice components.

**Outside-in TDD checklist:**

- [x] Component test (B5, B6): `QrGenerator` covers three cases:
    - picking each frame and shape changes the preview
    - the frame text is cut at 16 characters, with the counter showing it
    - "Markorik ez" hides the text field
- [x] Component test (B14): `Tabs`, where arrow keys, Home and End move and select, only the selected tab is focusable, and the tabs control their panels.
- [x] Component test (B14): `OptionTiles` is a named radio group (a legend), and arrow keys change the choice.
- [x] Component test (B6): `TextField` shows its counter and stops at `maxLength`.

**To-do:**

- [x] Shared UI: `Tabs`, `OptionTiles` (sizes `md` and `sm`), `TextField`.
- [x] Slice UI:
    - the tile drawings for the five frames, four dot shapes and three corner shapes
    - the "Markoa" and "Forma" panels
    - the tab state in `QrGenerator`
- [x] Check the new components against the design system; update the artifact where the code differs.

**Verify:**

- [x] The project's checks pass for what this phase touched (see `execute-plan`).
- [x] A phone scans the preview with every dot shape and corner shape.

## Phase 4: Add the colour controls and the contrast warning ✅

> Design: https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA (`Main.dc.html`, "Koloreak" tab, restyled per A2)

**Description:** Step 2's third tab, "Koloreak": palette presets, the four colour pickers, and the warning when the colours would be hard to scan.

**Outside-in TDD checklist:**

- [x] Component test (B5, B7, B8): `QrGenerator` covers four cases:
    - a preset sets the four colours and is selected
    - changing a colour deselects it
    - a light QR colour on a dark background shows the "inverted" warning
    - a pale QR colour on white shows the "low contrast" warning
- [x] Unit test (B8): the preset that matches a set of colours, or none.
- [x] Component test (B14): `SwatchPicker` is a named radio group whose swatches have colour names. `ColorField` is labelled and shows the hex value. `Notice` warnings use `role="status"` and errors `role="alert"`.

**To-do:**

- [x] Domain: the palette presets from the design system (Morea, Lila, Menda, Mertxikia, Gurina, Gaua, adjusted so each keeps the QR dark on a light background) and the matching rule.
- [x] Shared UI: `SwatchPicker`, `ColorField`, `Notice`.
- [x] Slice UI: the "Koloreak" panel, and the warning text for `low` and `inverted`.
- [x] Check the new components against the design system; update the artifact where the code differs.

**Verify:**

- [x] The project's checks pass for what this phase touched (see `execute-plan`).

## Phase 5: Export QR files

**Description:** The second use case, `exportQrCode`, with its ports, fakes and adapters, and the frame text drawn as Unbounded outlines. It has no UI yet, so the export logic is tested on its own before it gets buttons. About 15 files, because the three ports come with a fake and a real adapter each.

**Outside-in TDD checklist:**

- [x] Acceptance test (B10, B11, B12): `exportQrCode` with `FakeImageRasterizer`, `InMemoryFileSaver` and `BoxFrameTextOutliner`.
    - SVG saves `kode-qr.svg`, whose label is the outliner's `<path>` in the frame-text colour, with no `<text>` and no external URL.
    - PNG and WebP pass that same outlined SVG to the rasterizer with `longSide: 1024` and save `kode-qr.png` and `kode-qr.webp`.
    - WebP on a rasterizer that can't encode it saves nothing and answers `"webp-unsupported"`.
    - An invalid link saves nothing.
- [x] Unit test (B10): `renderQrSvg` with `outlineFrameText` draws the label as a `<path>` from it, given the label slot, and without it as a `<text>`; no frame, or blank text, draws neither.
- [x] Contract test (B10): a `FrameTextOutliner` suite run against `BoxFrameTextOutliner` and `OpentypeFrameTextOutliner` (reading the TTF from disk): blank text gives no path, a long text stays within the slot's `maxWidth`, centred on its `x`, and characters the font can't draw are left out and listed by `missing`.

**To-do:**

- [x] Ports: `ImageRasterizer`, `FileSaver`, `FrameTextOutliner`. Use case: `exportQrCode`.
- [x] Font: `bun add opentype.js@2.0.0` (with a minimal local type declaration for the calls used, as 2.0 ships no types), and the Latin-subset TTF of Unbounded 800 in `public/fonts/`, with `OFL.txt`.
- [ ] Adapters:
    - `CanvasImageRasterizer` draws the SVG through an `<img>` onto a canvas sized to `longSide` and calls `toBlob`. Its `canEncode` checks the returned blob's `type`.
    - `BrowserFileSaver` uses an object URL and a temporary `<a download>`.
    - `OpentypeFrameTextOutliner` imports `opentype.js` and fetches the font on first `load()`, then fits the text to the slot with the glyphs' real advance widths.
- [x] Fakes: `FakeImageRasterizer`, `InMemoryFileSaver`, `BoxFrameTextOutliner` (one box per character, so fitting is easy to check).

**Verify:**

- [ ] The project's checks pass for what this phase touched (see `execute-plan`).
- [ ] Render a framed, outlined code to PNG in Chrome from a scratch page, check the label is Unbounded, and scan it with a phone.

## Phase 6: Download from the generator

> Design: https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA (`AltLauburuGoxoa.dc.html`, step 3)

**Description:** Step 3: the format picker and the download button, wired to `exportQrCode` with the browser adapters. WebP is disabled where it can't be encoded.

**Outside-in TDD checklist:**

- [ ] Component test (B10, B11, B12, B13): `QrGenerator` with the fakes injected covers four cases:
    - "Deskargatu PNG" saves `kode-qr.png`, and the label follows the chosen format
    - an invalid link disables the button
    - on a rasterizer without WebP the WebP option is disabled and the explanation shown
    - a success message names the saved file
- [ ] Component test (B14): `SegmentedControl` is a named radio group that can disable one option. `Button` renders `<a>` with `href` and `<button>` without, and a disabled button can't be clicked.

**To-do:**

- [ ] Shared UI: `SegmentedControl` (with a disabled option), `Button` (`primary`, `secondary`, `outline`; `md`, `lg`).
- [ ] Slice UI: step 3 in `QrGenerator`, with the adapters passed in as props so tests can inject fakes, and the success and WebP messages.
- [ ] Slice UI: once the outliner has loaded, the preview draws the frame text with the same outlines, so it stays exactly the file people download, and the hint under the frame text field names any characters that won't be drawn.
- [ ] Check the new components against the design system; update the artifact where the code differs.

**Verify:**

- [ ] The project's checks pass for what this phase touched (see `execute-plan`).
- [ ] Resolve risks 2 and 3 by hand. In Chrome, Firefox and Safari, download every format. The browser's network panel shows no request carrying the link (B13). A phone scans each file.

## Phase 7: Finish the landing page

> Design: https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA (`AltLauburuGoxoa.dc.html`, hero)

**Description:** The A2 hero above the generator, the page metadata, the favicon and the footer, checked on the real Worker.

**Outside-in TDD checklist:**

- [ ] Component test (B15): the home page's hero has the `h1` "QR kodeak. Euskaraz. Doan.", the paragraph from the brief, and a "Hasi orain" link to `#sortzailea`.
- [ ] Component test: `Stamp` and `Tag` render their text (only if they end up with logic; otherwise covered by the page test).

**To-do:**

- [ ] Shared UI: `Tag`, `Stamp`, `QrSticker`.
- [ ] Hero in `page.tsx`, with three parts:
    - the dashed tag
    - the headline with the wavy underline on "Doan."
    - the paragraph, "Hasi orain", and the tilted sample `QrSticker` with the "Doan!" stamp. The sample is rendered at build time with `designQrCode` and the real encoder.
- [ ] Metadata: a Basque title and description for `/`, and `src/app/icon.svg` from the design system's `kode-mark.svg`.
- [ ] Footer: "QR Code DENSO WAVE Incorporated-en marka erregistratua da." and kode.eus.
- [ ] Check the new components against the design system; update the artifact where the code differs.

**Verify:**

- [ ] The project's checks pass for what this phase touched (see `execute-plan`).
- [ ] On `bun run preview` (the real Worker on `workerd`), the page renders, generates and downloads, and nothing overflows at 360 px wide.

## Next step

Phase 5: add `opentype.js` and the Unbounded TTF, then the `OpentypeFrameTextOutliner` with its contract test, then `CanvasImageRasterizer` and `BrowserFileSaver`. Run `/execute-plan .agents/plans/qr-generator`.
