<!-- Board: ./board.md -->

# Plan: Kontaktua and Ekitaldia

## Goal

Add the two structured types: Kontaktua (a vCard) and Ekitaldia (a calendar event). They bring Disclosure, for optional fields out of the way, and DateTimeField.

## Behaviour

- **B1.** Kontaktua needs a first name. Abizenak, Telefonoa, Posta and the Lana, Webgunea, Helbidea and Oharra sections are optional, and the optional sections start closed, except Lana. — _proved by:_
- **B2.** Kontaktua encodes a vCard 3.0:
    - lines end in CRLF;
    - each value has `\`, `,`, `;` and line breaks escaped;
    - only filled fields get a line;
    - the lines are `N:<abizenak>;<izena>;;;`, `FN:<izena abizenak>`, `TEL;TYPE=CELL:+<international>`, `EMAIL`, `ORG`, `TITLE`, `URL`, `ADR;TYPE=WORK:;;<kalea>;<herria>;;<posta-kodea>;` and `NOTE`.

    — _proved by:_

- **B3.** Kontaktua's phone uses PhoneField and its rules (plan 2); its email uses Posta's address rule (plan 3); its website uses Esteka's link rule. — _proved by:_
- **B4.** Ekitaldia needs a title and a start. The end is optional, and an end before the start is refused. Moving the start past the end moves the end with it, keeping the same length. — _proved by:_
- **B5.** Ekitaldia encodes `BEGIN:VEVENT`, `SUMMARY`, `DTSTART`, `DTEND` (when set), `LOCATION`, `DESCRIPTION` and `URL` (when filled), and `END:VEVENT`, escaped as in B2:
    - times are converted from the browser's time zone to UTC (`…Z`);
    - with "Egun osoa" on, the fields ask for dates only and the code holds `DTSTART;VALUE=DATE:` and an exclusive `DTEND;VALUE=DATE:` the day after the last day.

    — _proved by:_

- **B6.** The time zone used is named under the dates ("Orduak zure ordu-eremukoak dira (Europe/Madrid)…"). — _proved by:_
- **B7.** Disclosure rows open and close with Enter and Space, announce whether they are open, and keep their fields' values when closed. A closed section's filled fields still go into the code. — _proved by:_
- **B8.** Manual: the vCard saves the contact, accents included, and the event adds itself to the calendar at the right local time, from an iPhone camera and from Google Lens. — _proved by:_ manual.

## Context

### Sources

- [brief.md](brief.md).
- Page designs, `EdukiaKontaktua.dc.html` and `EdukiaGertaera.dc.html` (the Ekitaldia form): <https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA>.
- Design system, `Disclosure`, `DateTimeField`, `Switch`, and the `contact`, `calendar` and `plus` icons: <https://claude.ai/artifact/F6S7WRQ3iMjcHHgbProwWe>.
- RFC 2426, vCard 3.0: <https://www.rfc-editor.org/rfc/rfc2426>. RFC 5545, iCalendar: <https://www.rfc-editor.org/rfc/rfc5545>.

### Contracts

- **Domain:** `QrContent` gains `kontaktua` and `ekitaldia`, each with an encoder module and unit tests. Both share a text-escaping helper, `domain/content/escape-text.ts`, for the RFC 2426 and RFC 5545 rules.
- **Shared UI:** new `Disclosure` and `DateTimeField`; Icon gains `contact`, `calendar` and `plus`.

### Dependencies

- Plan 1 blocks every phase.
- Plan 2 (PhoneField and the phone rules) blocks phase 1.
- Plan 3 (the TextField extensions, the address rule and Switch) blocks phases 1 and 2.

## Open questions and risks

| #   | Question or risk                                                                                                                                                                                        | Source | Affects | Status |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------- | ------ |
| 1   | Some scanners only take a bare `VEVENT`, others want it inside `BEGIN:VCALENDAR` with `VERSION:2.0`. Test both on an iPhone camera and Google Lens at the start of phase 2, and ship the one both read. | B5, B8 | Phase 2 | Open   |
| 2   | A full contact with every section may reach Trinkoa. The density meter warns about it, but check that a realistic card stays at Ertaina or below.                                                       | Plan 1 | Phase 1 | Open   |

## Phase 1: Add Disclosure and Kontaktua

> Design: <https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA> (`EdukiaKontaktua.dc.html`)

**Outside-in TDD checklist:**

- [ ] Acceptance test `design-qr-code` (B1, B2, B3): the name alone, a full card and an invalid phone or email inside the card.
- [ ] Component test `qr-generator` (B1, B7): Lana starts open and the rest start closed; opening Helbidea and typing adds the address to the code; closing it keeps the address.
- [ ] Component test `disclosure.test.tsx` (B7).
- [ ] Unit tests `content/kontaktua` and `escape-text` (B2).

**To-do:**

- [ ] Build `src/shared/ui/disclosure.tsx` to the design system. Add the `contact` and `plus` icons.
- [ ] Add `domain/content/escape-text.ts`, `domain/content/kontaktua.ts`, its `QrContent` member, `forms/kontaktua-form.tsx` and its registry entry.
- [ ] Below the form, show "Zenbat eta datu gehiago, orduan eta QR trinkoagoa…".
- [ ] If the code diverges from the design system's README or preview, update the artifact in the same change.

**Verify:**

- [ ] `bun run qa` passes with zero warnings.
- [ ] B8 for Kontaktua.

## Phase 2: Add DateTimeField and Ekitaldia

> Design: <https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA> (`EdukiaGertaera.dc.html`)

**Outside-in TDD checklist:**

- [ ] Acceptance test `design-qr-code` (B4, B5): a timed event in Europe/Madrid across a daylight-saving change, an all-day event over two days, and an end before the start.
- [ ] Component test `qr-generator` (B4, B6): moving the start past the end moves the end; "Egun osoa" switches both fields to dates; the time zone line names the browser's zone.
- [ ] Component test `date-time-field.test.tsx`: the `datetime-local` and `date` types, `min`, and messages.
- [ ] Unit test `content/ekitaldia` (B5): the UTC conversion with an injected time zone, the exclusive all-day end, and escaping.

**To-do:**

- [ ] Resolve open question 1 by scanning both shapes on real phones.
- [ ] Build `src/shared/ui/date-time-field.tsx` to the design system. Add the `calendar` icon.
- [ ] Add `domain/content/ekitaldia.ts`. It takes the time zone as input, so it stays pure and testable. Add its `QrContent` member.
- [ ] Add `forms/ekitaldia-form.tsx`:
    - Izenburua;
    - Hasiera and Amaiera side by side;
    - the "Egun osoa" switch and its time zone hint;
    - Lekua (optional);
    - the closed Azalpena and "Esteka (sarrerak, izen-ematea)" sections.
- [ ] Register Ekitaldia (label "Ekitaldia", never "Gertaera") with its scan sentence.

**Verify:**

- [ ] `bun run qa` passes with zero warnings.
- [ ] B8 for Ekitaldia.

## Next step

Phase 1: build Disclosure and ship Kontaktua. Run `/execute-plan .agents/plans/qr-content-types`.
