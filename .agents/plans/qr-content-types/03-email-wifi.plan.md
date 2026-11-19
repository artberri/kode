<!-- Board: ./board.md -->

# Plan: Posta and WiFi

## Goal

Add Posta and WiFi. Posta brings the TextField extensions that later forms reuse. WiFi brings PasswordField and Switch, and is the type most likely to be printed and left on a wall.

## Behaviour

- **B1.** Posta needs a valid recipient address; any other recipient is refused with "Adibidez: izena@domeinua.eus". The subject and message are optional, and the message stops at 500 characters. — _proved by:_
- **B2.** Posta encodes `mailto:<address>`. It adds `subject` and `body` only when they are filled, both percent-encoded with `%20` for spaces, never `+`. — _proved by:_
- **B3.** Fields marked optional show " (aukerakoa)" after the label, and required fields show nothing extra. — _proved by:_
- **B4.** WiFi needs a network name of up to 32 bytes. Security is one of WPA/WPA2/WPA3 (the default), WEP or Irekia. — _proved by:_
- **B5.** The password is refused when it doesn't fit the security type:
    - WPA needs 8–63 characters, or exactly 64 hexadecimal digits;
    - WEP needs 5 or 13 characters, or 10 or 26 hexadecimal digits;
    - with Irekia the password field disappears and the code holds no password.

    — _proved by:_

- **B6.** WiFi encodes `WIFI:T:<WPA|WEP|nopass>;S:<name>;P:<password>;` plus `H:true;` when "Sare ezkutua da" is on, ending in `;;`. `\`, `;`, `,`, `:` and `"` in the name and password are escaped with a backslash. — _proved by:_
- **B7.** The password is hidden by default. "Erakutsi" shows it and becomes "Ezkutatu", with `aria-pressed` saying which state it is in. The browser isn't offered the field for autofill. — _proved by:_
- **B8.** Manual: the WiFi code joins the network from an iPhone camera and from Google Lens, including a name or password with `;` and accents; the Posta code opens a mail app with the subject and message. — _proved by:_ manual.

## Context

### Sources

- [brief.md](brief.md).
- Page designs, `EdukiaPosta.dc.html` and `EdukiaWifi.dc.html`: <https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA>.
- Design system, `TextField` (the new props), `PasswordField`, `Switch`, `SegmentedControl`, and the `mail` and `wifi` icons: <https://claude.ai/artifact/F6S7WRQ3iMjcHHgbProwWe>.
- The WIFI: format, as ZXing documents it: <https://github.com/zxing/zxing/wiki/Barcode-Contents#wi-fi-network-config-android-ios-11>.
- RFC 6068, the `mailto` URI: <https://www.rfc-editor.org/rfc/rfc6068>.

### Key files

| Area       | Files                                                                                                                                                                                             |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Shared UI  | [text-field.tsx](../../../src/shared/ui/text-field.tsx), [text-field.test.tsx](../../../src/shared/ui/text-field.test.tsx), [segmented-control.tsx](../../../src/shared/ui/segmented-control.tsx) |
| Frame text | [design-panels.tsx](../../../src/qr-code/infrastructure/ui/design-panels.tsx): the existing TextField consumer, which must keep working unchanged                                                 |

### Contracts

- **Domain:** `QrContent` gains `posta` (`to`, `subject`, `body`) and `wifi` (`ssid`, `security`, `password`, `hidden`), each with an encoder module and unit tests.
- **Shared UI:**
    - TextField gains `optional`, `type`, `inputMode`, `autoComplete`, `prefix`, `error`, `success` and `onBlur`. Existing props keep their meaning.
    - New `PasswordField` and `Switch`.
    - Icon gains `mail` and `wifi`.

### Dependencies

- Plan 1 blocks every phase.

## Phase 1: Extend TextField and add Posta

> Design: <https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA> (`EdukiaPosta.dc.html`)

**Outside-in TDD checklist:**

- [ ] Acceptance test `design-qr-code` (B1, B2): an address alone, an address with subject and message, and an invalid address.
- [ ] Component test `qr-generator` (B1, B3): Posta's fields with "(aukerakoa)" on the subject and message; an invalid address shows its error after leaving the field.
- [ ] Component test `text-field.test.tsx` (B3): `optional`, `prefix` (visual only), `error` (border, `aria-invalid`, announced) and `success`, and only one message shows. The existing frame-text cases still pass.
- [ ] Unit test `content/posta` (B2): `%20` for spaces, "&" and "?" escaped in the subject and body, and no empty parameters.

**To-do:**

- [ ] Extend `src/shared/ui/text-field.tsx` to the design system's `TextFieldProps`.
- [ ] Add `domain/content/posta.ts`, its `QrContent` member, `forms/posta-form.tsx` (recipient and subject side by side from 480px, then the message) and the registry entry with the `mail` icon.

**Verify:**

- [ ] `bun run qa` passes with zero warnings.
- [ ] B8 for Posta.

## Phase 2: Add WiFi

> Design: <https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA> (`EdukiaWifi.dc.html`)

**Outside-in TDD checklist:**

- [ ] Acceptance test `design-qr-code` (B4, B5, B6): WPA, WEP, Irekia and hidden, plus names and passwords that need escaping.
- [ ] Component test `qr-generator` (B5, B7): choosing Irekia removes the password field; "Erakutsi" toggles the input type and `aria-pressed`; the hidden-network switch changes the code.
- [ ] Component tests `password-field.test.tsx` (B7) and `switch.test.tsx`. The switch is a checkbox with `role="switch"`, its label and its hint.
- [ ] Unit test `content/wifi` (B4, B5, B6): the escaping, the length rules per security type, the 32-byte name and `nopass`.

**To-do:**

- [ ] Build `src/shared/ui/password-field.tsx` and `src/shared/ui/switch.tsx` to the design system. Add the `wifi` icon.
- [ ] Add `domain/content/wifi.ts`, its `QrContent` member and `forms/wifi-form.tsx`:
    - the network name;
    - a SegmentedControl "Segurtasuna", with the hint "Ez badakizu, utzi WPA…";
    - the password, with the hint "Pasahitza ez da zure gailutik ateratzen…";
    - the "Sare ezkutua da" switch.
- [ ] Register WiFi with its scan sentence.
- [ ] If the code diverges from the design system's README or preview, update the artifact in the same change.

**Verify:**

- [ ] `bun run qa` passes with zero warnings.
- [ ] B8 for WiFi.

## Next step

Phase 1: extend TextField and ship Posta. Run `/execute-plan .agents/plans/qr-content-types`.
