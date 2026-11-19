# Brief: QR content types

## Description

Let people make a QR code from eleven kinds of content, not only links: Esteka, Testua, Telefonoa, WhatsApp, SMSa, Posta, WiFi, Kontaktua, Ekitaldia, Kokapena and Sare sozialak. Everything still runs in the browser, with no backend: each type writes its content straight into the code in a format phone cameras understand. Types that would need hosting (PDF, images, video, store-picking app links, bio pages, feedback forms, payment pages, editable or tracked codes) are out of scope and listed in [`docs/FOLLOW_UPS.md`](../../../docs/FOLLOW_UPS.md).

## Sources

- Page designs, the "QR motak" rows of the canvas: <https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA>. `MotaB.dc.html` ("✓ Mota B · Pilulak") is the approved type picker; `Edukia*.dc.html` hold one form per type (`EdukiaGertaera.dc.html` is the Ekitaldia form). `MotaA` and `MotaC` were rejected.
- Design system, updated for this work: <https://claude.ai/artifact/F6S7WRQ3iMjcHHgbProwWe>. New components ChoiceChips, TextArea, PhoneField, PasswordField, Switch, DateTimeField, Disclosure and DensityMeter; TextField gains `optional`, `type`, `autoComplete`, `prefix`, `error` and `success`; Icon gains `plus`, `chevron-down`, `scan`, one icon per type and ten `brand-*` icons from Tabler Icons 3.24.0 (MIT). The README covers the new copy rules ("aukerakoa", help under the field, "Eskaneatzean:", Ekitaldia never Gertaera).
- A competitor's screens, reviewed in conversation: the reference for what each type asks for, not for the look. Left out on purpose: phone mock-ups, ⓘ tooltips, QR names and custom short links.

## Decisions taken while planning

- Type picker: pills (ChoiceChips) at the top of "1 · Edukia", Esteka selected by default. The steps stay Edukia · Diseinua · Deskarga.
- Switching type keeps what was typed in each type for the visit, in memory only.
- Content over 1,000 UTF-8 bytes is refused before encoding (the link limit today), which keeps every code at version 31 (141 modules) or below at level Q. Version 25 (117 modules) would mean 715 bytes; the density meter flags dense codes instead.
- Phone numbers: a country chip with the browser's own country list in Basque; the default country comes from the browser (language region, then time zone, then Spain). 6–15 digits.
- Validation: Posta needs a valid recipient; WiFi needs a network name and, unless the network is open, a password (WPA 8–63 characters); Kontaktua needs a first name; Ekitaldia needs a title and a start, and the end can't be before the start; Kokapena needs an address or coordinates in range; Sare sozialak needs a username, and Mastodon also its server.
- Kokapena ships both modes (Helbidea, Koordenatuak) and both maps (Google Maps, OpenStreetMap).
- Downloads are named after the type: `kode-wifi.png`, `kode-esteka.svg`.
- The page lead changes from "Itsatsi esteka, …" to something like "Aukeratu zer partekatu, jolastu markoarekin, formekin eta koloreekin, eta deskargatu."; Claude proposes the final wording when the last type lands.
- Social network icons come from Tabler Icons (MIT), outline, in ink.

## Execution order

1. Core and first new type: the content model, UTF-8 encoding, the type picker, Testua, the scan line and the density meter. Everything after builds on it.
2. Phone types: Telefonoa, WhatsApp, SMSa (PhoneField).
3. Posta and WiFi.
4. Kontaktua and Ekitaldia.
5. Kokapena and Sare sozialak, and the page copy.

Plans 2 to 5 only depend on plan 1; their order follows the components they share and how often people need each type.
