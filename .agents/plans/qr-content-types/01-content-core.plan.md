<!-- Board: ./board.md -->

# Plan: Content core, type picker and Testua

## Goal

Turn the generator from "a link" into "content of a type". This means a domain content model with one encoder per type, UTF-8 encoding, use cases that take content, and the type pills in "1 · Edukia". Ship Testua as the first new type, plus the "Eskaneatzean:" line and the density meter that every later type relies on.

## Behaviour

- **B1.** Esteka behaves as today: the same errors, the same "https:// gehitu diogu hasieran" confirmation, the same preview label and the same encoded link. — _proved by:_ `design-qr-code.acceptance.test.ts`, "rejects $link as $reason, without encoding anything" and "encodes the normalised link and says whether https:// was added"; `qr-generator.test.tsx`, "says https:// was added and names the preview with the full link" and the error cases, unchanged
- **B2.** A download is named after its type and format: `kode-esteka.png`, `kode-testua.svg`. — _proved by:_ `export-qr-code.acceptance.test.ts`, "saves the SVG as kode-esteka.svg, …" and "draws the same outlined SVG at 1024 px and saves kode-esteka.%s"; `qr-generator.download.test.tsx`, "downloads kode-esteka.png, …"
- **B3.** Content whose payload is over 1,000 UTF-8 bytes is refused as too long, without encoding anything, with a message that says how much to cut. — _proved by:_ `encode-content.test.ts`, "limitPayload › counts UTF-8 bytes, so ñ counts as two, and says how many bytes to cut" (the domain refusal, with `excessBytes`); `design-qr-code.acceptance.test.ts`, "refuses a text over 1000 UTF-8 bytes, without encoding anything"; the message comes with the Testua form in phase 2
- **B4.** A scanner reads the code back byte for byte, accents and symbols included ("Goñi · Azpeitia — 19:00"). — _proved by:_ `qr-matrix-encoder.contract.test.ts`, "QrcodeGeneratorEncoder › encodes Goñi · Azpeitia — 19:00 🎶 so a reader decodes it back" and "writes the text as UTF-8 bytes, as phone cameras expect"
- **B5.** "1 · Edukia" opens with the pills "Zer partekatu nahi duzu?" and Esteka selected. The pills list only the types that work. — _proved by:_
- **B6.** Switching type keeps what was typed in each type for the visit. Switching back shows it again, and the preview follows the selected type. Nothing is stored. — _proved by:_
- **B7.** Testua encodes the text exactly as typed. Text that is only whitespace counts as empty: no error, and the sample preview shows. The field stops at 500 characters, with a counter. — _proved by:_
- **B8.** While the content is valid, the download side says what scanning will do ("Eskaneatzean: testua pantailan erakutsiko du, kopiatzeko prest."). While it isn't, the line is absent. — _proved by:_
- **B9.** While the content is valid, the density meter shows the code's size ("33×33 modulu") and its level: Arina up to 45 modules, Ertaina up to 69, Trinkoa above. Each level has its sentence. While the content isn't valid, the meter is absent. — _proved by:_

## Context

### Sources

- [brief.md](brief.md): decisions and sources for the whole board.
- Page designs, `MotaB.dc.html` and `EdukiaTestua.dc.html`: <https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA>.
- Design system, `ChoiceChips`, `TextArea`, `DensityMeter` and `Icon`, plus the README's "Spacing and layout" for the step layout: <https://claude.ai/artifact/F6S7WRQ3iMjcHHgbProwWe>.

### Key files

| Area         | Files                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Use cases    | [design-qr-code.ts](../../../src/qr-code/application/design-qr-code.ts), [export-qr-code.ts](../../../src/qr-code/application/export-qr-code.ts) and their `.acceptance.test.ts`                                                                                                                                                                                                                                                                                                                           |
| Encoder port | [qr-matrix-encoder.ts](../../../src/qr-code/application/qr-matrix-encoder.ts), [qrcode-generator-encoder.ts](../../../src/qr-code/infrastructure/qrcode-generator-encoder.ts), [fixed-matrix-encoder.ts](../../../src/qr-code/infrastructure/fixed-matrix-encoder.ts), [qr-matrix-encoder.contract.test.ts](../../../src/qr-code/infrastructure/qr-matrix-encoder.contract.test.ts)                                                                                                                        |
| Domain       | [parse-link.ts](../../../src/qr-code/domain/parse-link.ts) (stays Esteka's parser), [qr-matrix.ts](../../../src/qr-code/domain/qr-matrix.ts)                                                                                                                                                                                                                                                                                                                                                               |
| Generator UI | [qr-generator.tsx](../../../src/qr-code/infrastructure/ui/qr-generator.tsx), [link-step.tsx](../../../src/qr-code/infrastructure/ui/link-step.tsx), [qr-preview.tsx](../../../src/qr-code/infrastructure/ui/qr-preview.tsx), [download-step.tsx](../../../src/qr-code/infrastructure/ui/download-step.tsx), [qr-generator.test.tsx](../../../src/qr-code/infrastructure/ui/qr-generator.test.tsx), [qr-generator.download.test.tsx](../../../src/qr-code/infrastructure/ui/qr-generator.download.test.tsx) |
| Shared UI    | [icon.tsx](../../../src/shared/ui/icon.tsx), [radio-group.tsx](../../../src/shared/ui/radio-group.tsx), [segmented-control.tsx](../../../src/shared/ui/segmented-control.tsx) (pattern for ChoiceChips), [text-field.tsx](../../../src/shared/ui/text-field.tsx) (pattern for TextArea)                                                                                                                                                                                                                    |

### Contracts

- **Domain content model** (new, `src/qr-code/domain/`):
    - `QrContentType` lists all eleven slugs from the start: `esteka`, `testua`, `telefonoa`, `whatsapp`, `sms`, `posta`, `wifi`, `kontaktua`, `ekitaldia`, `kokapena`, `sareak`. Each slug is also the download name.
    - `QrContent` is a discriminated union on `type`, holding each type's form values. This plan defines `{ type: "esteka"; link }` and `{ type: "testua"; text }`, and later plans add a member each.
    - `encodeContent(content)` is exhaustive over the union and returns one of three shapes:
        - `{ status: "empty" }` when nothing required is filled;
        - `{ status: "invalid"; problems }`, one `{ field, reason }` per wrong field, with reason codes and no copy;
        - `{ status: "valid"; payload }` plus what the UI needs per type (Esteka keeps `link` and `schemeAdded`).
    - Each type's encoder lives in its own module under `domain/content/`, next to its unit test.
    - `MAX_PAYLOAD_BYTES = 1000`, measured with `TextEncoder`. It replaces the per-link check as the general limit; `MAX_LINK_LENGTH` stays as Esteka's own rule.
- **Use cases:**
    - `DesignQrCodeInput` and `ExportQrCodeInput` take `content: QrContent` instead of `link: string`.
    - `DesignQrCodeResult` becomes `empty | invalid (problems) | ready`. The `ready` case carries the encoded content, `svg`, `contrast` and, from phase 3, `modules`, the matrix size.
    - `ExportQrCodeResult`'s `no-link` becomes `invalid-content`.
    - The file name is `kode-<type>.<format>`.
- **`QrMatrixEncoder` port:** the text is encoded as UTF-8 bytes. Today `QrcodeGeneratorEncoder` relies on links being ASCII, and its doc comment must change. `qrcode-generator` 2.0.4 offers `stringToBytesFuncs["UTF-8"]` and a `dist/qrcode_UTF8.mjs` build: read its README and pick one in phase 1.
- **Screens:** "1 · Edukia" holds the type pills and the selected type's form. The download side gains the scan line and the density meter.
    - Each type's Basque copy lives in one UI registry, `infrastructure/ui/content-types.tsx`, so later plans add a type in one place. Per type it holds: the label, the icon, the form, the scan sentence, the preview label, and the error message for each reason.
- **Shared UI** (already in the design system): new `ChoiceChips`, `TextArea` and `DensityMeter`; Icon gains `text` and `scan`.

## Open questions and risks

| #   | Question or risk                                                                                                                                                                                                                                                         | Source           | Affects | Status   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------- | -------- |
| 1   | Does `jsqr` give UTF-8 back in `data`, or only raw bytes in `binaryData`? Resolved: `data` is the UTF-8-decoded text, and the contract test checks `binaryData` against `TextEncoder` too.                                                                               | Encoder contract | Phase 1 | Resolved |
| 2   | The density thresholds (45 and 69 modules at level Q) are an estimate. Check them by scanning printed codes at 3 cm on a few phones and adjust the design system if they're wrong.                                                                                       | Design           | Phase 3 | Open     |
| 3   | `MAX_LINK_LENGTH` and `MAX_PAYLOAD_BYTES` are both 1,000. A link with non-ASCII characters is percent-encoded by `new URL`, so it stays ASCII and the two limits agree. Resolved: pinned by `encode-content.test.ts`, "keeps every valid link within the byte limit, …". | Domain           | Phase 1 | Resolved |

## Phase 1: Encode content by type ✅

**Description:** This is the model and use-case change, with no new type yet: the generator still only offers Esteka. It lands first so later phases add types without touching the use cases again. It touches about 15 files because the input type ripples through both use cases, their tests and the three UI files that call them.

**Outside-in TDD checklist:**

- [x] Acceptance test `design-qr-code` (B1, B3): rewrite the link cases to pass `{ type: "esteka", link }`, with the same expectations. Add a payload over 1,000 bytes that is refused as too long, with nothing encoded. With only Esteka, a link can't pass its own 1,000-character rule and still be over 1,000 bytes, so this case is the link's `too-long`; the byte limit's own acceptance case moves to phase 2, with Testua.
- [x] Acceptance test `export-qr-code` (B2): the file is `kode-esteka.png`; invalid content answers `invalid-content`.
- [x] Unit test `encode-content` (B3): the byte limit counts UTF-8 bytes ("ñ" counts as 2) and is checked before any encoder runs. The check is `limitPayload`, exported and tested on its own, since no Esteka link reaches it.
- [x] Contract test `QrMatrixEncoder` (B4): a non-ASCII text round-trips through `jsqr` for `QrcodeGeneratorEncoder`; `FixedMatrixEncoder` still records what it was given.
- [x] Component tests: the existing `qr-generator` and `qr-generator.download` tests pass, with the file name updated to `kode-esteka.png`.

**To-do:**

- [x] Add `domain/qr-content.ts` (`QrContentType`, `QrContent`, the result types) and `domain/encode-content.ts` with the byte limit. Add `domain/content/esteka.ts`, which wraps `parseLink`.
- [x] Change `designQrCode` and `exportQrCode` to take `content`, encode through `encodeContent`, and name files `kode-<type>.<format>`. `encodeContent`'s valid case is `{ status: "valid", encoded }`, where `encoded` holds the `type`, the `payload` and Esteka's `link` and `schemeAdded`. The `ready` result carries the same `encoded`. The too-long problem is `{ field: "payload", reason: "too-long", excessBytes }`. `encodeContent` calls Esteka's encoder directly; the `switch` on `type` comes with the second type, as oxlint refuses a one-case switch.
- [x] Make `QrcodeGeneratorEncoder` encode UTF-8 and update its doc comment. Neither offered hook was used: 2.0.4 has no `stringToBytesFuncs` at runtime (only in its `.d.ts`), and `qrcode_UTF8.mjs` works by replacing the library's shared `stringToBytes`. The encoder passes one character per `TextEncoder` byte in byte mode instead.
- [x] Update `qr-generator.tsx`, `link-step.tsx`, `qr-preview.tsx` and `download-step.tsx` to hold and pass `{ type: "esteka", link }`. Copy and layout stay as they are.

**Verify:**

- [x] `bun run qa` passes with zero warnings.
- [x] On `bun run dev`, a link still previews and downloads as before, now as `kode-esteka.png`. The page, the field, the sample preview and the hero code render on dev; the download name is proved by `qr-generator.download.test.tsx`, not by a click in a real browser.

## Phase 2: Pick the type and write a text

> Design: <https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA> (`MotaB.dc.html`, `EdukiaTestua.dc.html`)

**Description:** This phase adds the type pills and the first new type, Testua, with the shared components they need. "1 · Esteka" becomes "1 · Edukia".

**Outside-in TDD checklist:**

- [x] Acceptance test `design-qr-code` (B3, B7): `{ type: "testua", text }` encodes the text as typed; whitespace-only text is `empty`; a text over 1,000 UTF-8 bytes is refused as too long, with nothing encoded.
- [ ] Component test `qr-generator` (B5, B6, B7):
    - the pills show with Esteka checked;
    - choosing Testua shows its field;
    - text typed there and a link typed in Esteka both survive switching back and forth;
    - the preview label follows the selected type.
- [ ] Component tests: `choice-chips.test.tsx` covers a radio group with a legend, arrow keys and an optional icon. `text-area.test.tsx` covers the label, "(aukerakoa)", the counter beside the hint and `maxLength`.
- [x] Unit test `content/testua`: the payload equals the text, and line breaks are kept.

**To-do:**

- [ ] Build `src/shared/ui/choice-chips.tsx` and `src/shared/ui/text-area.tsx` to the design system's README and `bundle.js`. Use `radio-group.tsx`'s `useRadioChange` for the chips.
- [ ] Add the `text` icon to `icon.tsx`, with its path from the design system.
- [x] Add `domain/content/testua.ts` and its member of `QrContent`. `encodeContent` picks the encoder from a table typed per type (`ENCODERS`) rather than a `switch`, which `consistent-return` refuses.
- [ ] Add `infrastructure/ui/content-types.tsx`, the registry, with Esteka and Testua. Add `infrastructure/ui/forms/testua-form.tsx`: TextArea "Zure testua", max 500, hint "Testua bera gordetzen da QRan: ez du ezer irekitzen."
- [ ] Replace `link-step.tsx` with `content-step.tsx`: StepLabel "Edukia", the ChoiceChips and the selected form. Move the Esteka field and its messages into `forms/esteka-form.tsx` unchanged.
- [ ] Keep one value object per type in `qr-generator.tsx`, so switching keeps what was typed.
- [ ] If the code diverges from the design system's README or preview, update the artifact in the same change.

**Verify:**

- [ ] `bun run qa` passes with zero warnings.
- [ ] On `bun run dev`, a Testua code with accents scans with an iPhone camera and with Google Lens and shows the text exactly.

## Phase 3: Say what scanning does and how dense the code is

> Design: <https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA> (the download side of any `Edukia*.dc.html`)

**Description:** This adds the "Eskaneatzean:" line and the DensityMeter to the download side, so every later type gets them by adding a sentence to the registry.

**Outside-in TDD checklist:**

- [ ] Acceptance test `design-qr-code` (B9): the `ready` result carries `modules`, equal to the matrix size (21 with `FixedMatrixEncoder`).
- [ ] Component test `qr-generator` (B8, B9): with valid content, the scan sentence and "21×21 modulu" with "Arina" show; with empty or invalid content, neither does.
- [ ] Component test `density-meter.test.tsx` (B9): 45 is Arina, 46 and 69 are Ertaina, and 70 is Trinkoa. Each level has its sentence, and the bar is hidden from assistive tech.

**To-do:**

- [ ] Add `modules` to `DesignQrCodeResult`'s `ready` case.
- [ ] Build `src/shared/ui/density-meter.tsx` to the design system. Add the `scan` icon.
- [ ] Add a scan sentence per type to the registry. Show the line and the meter in `download-step.tsx`, under the preview, as the design shows.
- [ ] If the code diverges from the design system's README or preview, update the artifact in the same change.

**Verify:**

- [ ] `bun run qa` passes with zero warnings.
- [ ] A long Testua text moves the meter from Arina through Ertaina to Trinkoa while typing.

## Next step

Phase 2: build ChoiceChips and TextArea, add Testua and the content registry, and turn "1 · Esteka" into "1 · Edukia". Run `/execute-plan .agents/plans/qr-content-types`.
