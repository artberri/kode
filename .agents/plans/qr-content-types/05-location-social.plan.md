<!-- Board: ./board.md -->

# Plan: Kokapena, Sare sozialak and the page copy

## Goal

Add the last two types, Kokapena and Sare sozialak, with their Tabler brand icons. Then rewrite the page copy so it no longer talks only about links.

## Behaviour

- **B1.** Kokapena offers "Helbidea" (the default) or "Koordenatuak":
    - an address needs some text;
    - coordinates need a latitude from -90 to 90 and a longitude from -180 to 180, accepting a comma or a point as the decimal mark.

    — _proved by:_

- **B2.** Kokapena encodes a map link:
    - Google Maps (the default) is `https://www.google.com/maps/search/?api=1&query=<address or lat,lng>`;
    - OpenStreetMap is `https://www.openstreetmap.org/search?query=<address>` for an address, or `https://www.openstreetmap.org/?mlat=<lat>&mlon=<lng>#map=17/<lat>/<lng>` for coordinates;
    - the query is percent-encoded.

    — _proved by:_

- **B3.** "Probatu esteka nabigatzailean" opens the encoded link in a new tab, without giving it access to the page. — _proved by:_
- **B4.** Sare sozialak offers Instagram, TikTok, YouTube, X, Facebook, LinkedIn, Mastodon, Bluesky, Telegram and Twitch, each with its Tabler icon, with Instagram selected by default. — _proved by:_
- **B5.** The username becomes the profile link:
    - `instagram.com/<u>`, `tiktok.com/@<u>`, `youtube.com/@<u>`, `x.com/<u>`, `facebook.com/<u>`, `linkedin.com/in/<u>`, `bsky.app/profile/<handle>`, `t.me/<u>`, `twitch.tv/<u>`, and for Mastodon `<server>/@<u>`, all over https;
    - a leading "@" is dropped;
    - a pasted profile URL of the selected network is reduced to its username;
    - the success line shows the full link.

    — _proved by:_

- **B6.** Mastodon needs both a username and a server. "@izena@mastodon.eus", typed in the username field, fills both. — _proved by:_
- **B7.** A username with spaces, or with characters the network doesn't allow in a profile path, is refused with an example. — _proved by:_
- **B8.** The page's lead, its metadata description and the design system's "Real copy" no longer speak only of links, and the new wording is agreed with the user before it ships. — _proved by:_
- **B9.** Manual: each map link opens the right place in Google Maps or OpenStreetMap, and each network's link opens the profile (or the app), from an iPhone camera and from Google Lens. — _proved by:_ manual.

## Context

### Sources

- [brief.md](brief.md).
- Page designs, `EdukiaKokapena.dc.html` and `EdukiaSareak.dc.html`: <https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA>.
- Design system: the `pin`, `share` and `brand-*` icons (the path data in `components/bundle.js`), ChoiceChips with icons, and the README's "Real copy": <https://claude.ai/artifact/F6S7WRQ3iMjcHHgbProwWe>.
- Tabler Icons 3.24.0, outline brand icons, MIT: <https://github.com/tabler/tabler-icons> (the licence is in the npm package `@tabler/icons@3.24.0`).
- Google Maps URLs: <https://developers.google.com/maps/documentation/urls/get-started>.

### Key files

| Area      | Files                                                                                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Page copy | [page.tsx](../../../src/app/page.tsx) (`metadata.description`, the hero lead), [layout.tsx](../../../src/app/layout.tsx)                                  |
| Assets    | [ASSETS.md](../../../ASSETS.md), "Images and drawings"                                                                                                    |
| Security  | [docs/SECURITY_HEADERS.md](../../../docs/SECURITY_HEADERS.md): the CSP is unaffected, because the icons are inline and the map link is a plain navigation |

### Contracts

- **Domain:** `QrContent` gains `location` (`mode`, `address`, `latitude`, `longitude`, `map`) and `social` (`network`, `username`, `server`), each with an encoder module and unit tests.
- **Shared UI:** Icon gains `pin`, `share` and the ten `brand-*` icons. `brand-*` icons draw at 2px by default, as the design system's `Icon` does.
- **Assets:** one `ASSETS.md` row for the Tabler path data in `icon.tsx`, naming Tabler Icons 3.24.0, MIT, © Paweł Kuna.
- **Page metadata:** `metadata.description` in `page.tsx`.

### Dependencies

- Plan 1 blocks every phase.
- Plan 3 (the TextField `prefix` and `success`) blocks phase 2.

## Open questions and risks

| #   | Question or risk                                                                                                                                                                  | Source | Affects | Status |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------- | ------ |
| 1   | Brand logos are trademarks. Using them to link to a person's own profile is the use the brands' guidelines allow, but keep them in ink, unaltered and next to the network's name. | Design | Phase 2 | Open   |
| 2   | The final lead and description are the user's call. Propose two or three versions in phase 3 and wait for a pick.                                                                 | Brief  | Phase 3 | Open   |

## Phase 1: Add Kokapena

> Design: <https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA> (`EdukiaKokapena.dc.html`)

**Outside-in TDD checklist:**

- [ ] Acceptance test `design-qr-code` (B1, B2): an address in each map, coordinates in each map, and out-of-range coordinates.
- [ ] Component test `qr-generator` (B1, B3): switching to Koordenatuak shows Latitudea and Longitudea; the test link has the encoded `href`, `target="_blank"` and `rel="noopener noreferrer"`.
- [ ] Unit test `content/location` (B1, B2): decimal commas, percent-encoding and both map formats.

**To-do:**

- [ ] Add `domain/content/location.ts` and its `QrContent` member.
- [ ] Add `forms/location-form.tsx`:
    - a SegmentedControl "Nola adierazi lekua";
    - the address field, or Latitudea and Longitudea side by side;
    - a SegmentedControl "Zein mapatan ireki", with its hint;
    - the test link.
- [ ] Register Kokapena with the `pin` icon and its scan sentence.

**Verify:**

- [ ] `bun run qa` passes with zero warnings.
- [ ] B9 for Kokapena.

## Phase 2: Add Sare sozialak with the Tabler icons

> Design: <https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA> (`EdukiaSareak.dc.html`)

**Outside-in TDD checklist:**

- [ ] Acceptance test `design-qr-code` (B5, B6, B7): one username per network, a pasted profile URL, "@izena@mastodon.eus", and a username with a space.
- [ ] Component test `qr-generator` (B4, B5, B6):
    - the network chips have their icons and Instagram is checked;
    - the field's prefix chip follows the network;
    - choosing Mastodon shows the server field.
- [ ] Unit test `content/social` (B5, B6, B7).

**To-do:**

- [ ] Add the `share` and ten `brand-*` icons to `icon.tsx` from the design system's `bundle.js`, with the 2px default for brand icons. Add the `ASSETS.md` row.
- [ ] Add `domain/content/social.ts` and its `QrContent` member.
- [ ] Add `forms/social-form.tsx`:
    - ChoiceChips "Sare soziala", with icons and the Mastodon hint;
    - the username field with the network's prefix chip and success line;
    - the Mastodon server field.
- [ ] Register Sare sozialak with its scan sentence.
- [ ] If the code diverges from the design system's README or preview, update the artifact in the same change.

**Verify:**

- [ ] `bun run qa` passes with zero warnings.
- [ ] B9 for Sare sozialak.

## Phase 3: Rewrite the page copy for every type

**Description:** This phase runs once all eleven types work, so the copy describes what the page does.

**To-do:**

- [ ] Propose two or three versions of the lead and the description to the user, and wait for a pick.
- [ ] Update the hero lead and `metadata.description` in `page.tsx`, and the README's description of the generator if it only mentions links.
- [ ] Update the design system README's "Real copy" with the new lead.

**Verify:**

- [ ] `bun run qa` passes with zero warnings, including `page.test.tsx`.
- [ ] B8: the page, its metadata and the design system say the same thing.

## Next step

Phase 1: ship Kokapena. Run `/execute-plan .agents/plans/qr-content-types`.
