<!-- Board: ./board.md -->

# Plan: Phone types

## Goal

Add Telefonoa, WhatsApp and SMSa. They share a phone field with a country chip whose default comes from the browser, so people abroad don't have to fix the prefix first.

## Behaviour

- **B1.** The country chip starts on the browser's country:
    - the region of the first `navigator.languages` entry, explicit or likely (`eu` → ES, `fr-FR` → FR);
    - else the time zone's country;
    - else ES.

    — _proved by:_

- **B2.** The country list shows every country with its Basque name and calling code ("Frantzia (+33)"), the default first, then the rest in Basque alphabetical order. Picking one changes the prefix the code uses. — _proved by:_
- **B3.** The number is accepted with spaces, dashes, dots and brackets, which are stripped:
    - a pasted "+33 6 12…" or "0033 6 12…" sets the country from its prefix;
    - a national trunk "0" is dropped ("06 12…" in France encodes as +33 6 12…), except for Italy, where the 0 is part of the number.

    — _proved by:_

- **B4.** A number with fewer than 6 or more than 15 digits, or with letters, is refused with an error that gives an example. Half-typed numbers wait until the field is left, as links do. — _proved by:_
- **B5.** Telefonoa encodes `tel:+<code><number>`, and the scan line names the number in international format. — _proved by:_
- **B6.** WhatsApp encodes `https://wa.me/<code><number>`. When there is a message it adds `?text=` with the message percent-encoded (`%20` for spaces). The message is optional and stops at 300 characters. — _proved by:_
- **B7.** SMSa encodes `SMSTO:+<code><number>:<message>`. The message is optional and stops at 160 characters, with the counter. — _proved by:_
- **B8.** Each of the three types keeps its own number, country and message when switching types (plan 1, B6). — _proved by:_
- **B9.** Manual: the three codes open the dialler, WhatsApp and the SMS app with the number and message filled, on an iPhone camera and on Google Lens. — _proved by:_ manual, scanners can't run in tests.

## Context

### Sources

- [brief.md](brief.md).
- Page designs, `EdukiaTelefonoa.dc.html`, `EdukiaWhatsApp.dc.html` and `EdukiaSms.dc.html`: <https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA>.
- Design system, `PhoneField` (its README describes the default country and the list) and the `phone`, `chat`, `sms` and `chevron-down` icons: <https://claude.ai/artifact/F6S7WRQ3iMjcHHgbProwWe>.
- ITU-T E.164 calling codes, the source for the calling-code table: <https://www.itu.int/pub/T-SP-E.164D>.

### Key files

| Area      | Files                                                                                                                                          |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan 1    | `src/qr-code/domain/qr-content.ts`, `src/qr-code/domain/content/`, `src/qr-code/infrastructure/ui/content-types.tsx`                           |
| Shared UI | [text-field.tsx](../../../src/shared/ui/text-field.tsx) and [url-field.tsx](../../../src/shared/ui/url-field.tsx) (field and message patterns) |

### Contracts

- **Domain:**
    - `domain/phone-number.ts` normalises, validates and formats numbers in international format, including the trunk-0 rule.
    - `domain/countries.ts` maps ISO 3166-1 alpha-2 codes to calling codes and holds no names.
    - `domain/default-country.ts` holds a pure `defaultCountry(languages, timeZone)`.
    - `QrContent` gains `telefonoa`, `whatsapp` and `sms`, each with `country`, `number` and, for WhatsApp and SMSa, `message`.
- **Browser adapter:** a small hook reads `navigator.languages` and `Intl.DateTimeFormat().resolvedOptions().timeZone` once. Country names come from `Intl.DisplayNames(["eu"], { type: "region" })`.
- **Shared UI:** new `PhoneField`; Icon gains `phone`, `chat`, `sms` and `chevron-down`.

### Dependencies

- Plan 1 (content model, registry, TextArea, ChoiceChips) blocks every phase.

## Open questions and risks

| #   | Question or risk                                                                                                                                                                                                                  | Source        | Affects | Status |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------- | ------ |
| 1   | `new Intl.Locale(tag).maximize()` almost always yields a region, so a time-zone table may be dead weight. Decide in phase 1 whether to ship a zone-to-country table, or only fall back to ES when `navigator.languages` is empty. | Brief, B1     | Phase 1 | Open   |
| 2   | A browser without Basque locale data returns English names or the bare code from `Intl.DisplayNames`. Accept that fallback rather than ship names, and sort with `Intl.Collator("eu")`.                                           | Design system | Phase 1 | Open   |
| 3   | Trunk prefixes differ by country (Italy keeps its 0; a few countries use other trunk digits). The rule covers "0" except Italy. Countries with other trunk digits may need entries later.                                         | B3            | Phase 1 | Open   |

## Phase 1: Add the phone field and Telefonoa

> Design: <https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA> (`EdukiaTelefonoa.dc.html`)

**Description:** This builds PhoneField, the country default and the phone-number rules, and ships them with the simplest type that uses them.

**Outside-in TDD checklist:**

- [ ] Acceptance test `design-qr-code` (B5): `{ type: "telefonoa", country: "ES", number: "600 112 233" }` encodes `tel:+34600112233`.
- [ ] Component test `qr-generator` (B1, B2, B4, B5):
    - picking Telefonoa shows the chip on the default country;
    - choosing France re-encodes with +33;
    - a short number shows its error after leaving the field.
- [ ] Component test `phone-field.test.tsx`: the label, the select named "Herrialdea eta aurrizkia", the chip text, messages and the invalid state.
- [ ] Unit tests: `phone-number` (B3, B4: stripping, the +/00 prefix, the trunk 0 and the Italy exception, the 6–15 digit range), `default-country` (B1) and `content/telefonoa`.

**To-do:**

- [ ] Add `domain/countries.ts` from the E.164 list, and `domain/phone-number.ts`.
- [ ] Add `domain/default-country.ts` and the browser hook in `infrastructure/ui/`.
- [ ] Build `src/shared/ui/phone-field.tsx` to the design system. Add the `phone` and `chevron-down` icons.
- [ ] Add `domain/content/telefonoa.ts`, its `QrContent` member, `forms/telefonoa-form.tsx` and its registry entry.
- [ ] If the code diverges from the design system's README or preview, update the artifact in the same change.

**Verify:**

- [ ] `bun run qa` passes with zero warnings.
- [ ] With the browser language set to French, the chip starts on FR (B1).
- [ ] B9 for Telefonoa.

## Phase 2: Add WhatsApp and SMSa

> Design: <https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA> (`EdukiaWhatsApp.dc.html`, `EdukiaSms.dc.html`)

**Description:** This adds the two messaging types on top of PhoneField and TextArea.

**Outside-in TDD checklist:**

- [ ] Acceptance test `design-qr-code` (B6, B7): both payloads, with and without a message, and a message with accents and "&".
- [ ] Component test `qr-generator` (B8): numbers and messages typed in WhatsApp and in SMSa survive switching between them.
- [ ] Unit tests `content/whatsapp` and `content/sms` (B6, B7): percent-encoding with `encodeURIComponent`, no `?text=` without a message, and the colon after the number in `SMSTO`.

**To-do:**

- [ ] Add `domain/content/whatsapp.ts` and `domain/content/sms.ts` and their `QrContent` members.
- [ ] Add `forms/whatsapp-form.tsx` (300 characters, hint "Mezua idatzita agertuko da; bidali aurretik alda daiteke.") and `forms/sms-form.tsx` (160 characters, hint "160 karaktere arte mezu bakarrean doa.").
- [ ] Register both, with the `chat` and `sms` icons and their scan sentences.

**Verify:**

- [ ] `bun run qa` passes with zero warnings.
- [ ] B9 for WhatsApp and SMSa.

## Next step

Phase 1: build the phone-number rules and PhoneField, and ship Telefonoa. Run `/execute-plan .agents/plans/qr-content-types`.
