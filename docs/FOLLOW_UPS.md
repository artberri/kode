# Follow-ups

Work we want later but can't do now, usually because it needs a backend (storage, a redirect or hosted pages) and the site runs entirely in the browser today. Each entry says what it needs, so it can be picked up when that piece exists.

Remove an entry once it ships or becomes a plan in `.agents/plans/`.

## QR code types that need a backend

Static QR codes hold their content directly. These types need something hosted behind the code.

- **PDF, image and video.** Upload the file, host it and encode its URL. Needs file storage (R2) and an upload flow with size limits and abuse handling. Until then, a user who hosts the file elsewhere can use the website type.
- **App link that picks the store.** One code that sends iOS to the App Store and Android to Google Play. Needs a redirect that reads the user agent: a short link from the URL shortener.
- **Social networks page.** Several profiles on one page, with a name, photo and description. This is a bio page; build it in the bio pages product. A single profile already works as a static link.
- **Multiple links.** Same as above: a bio page.
- **Event page.** A hosted page with a cover image, programme, organiser and ticket link. The static event type (`VEVENT`, add to calendar) doesn't need it.
- **Rich vCard page.** A hosted contact page with a photo, logo and social links. The static vCard type covers the contact data itself.
- **Feedback form.** A hosted form that collects reviews or comments, with somewhere to store them. A link to an existing review page (Google, for example) already works as a static link.
- **Payments page.** A hosted page that takes payments. Static options (a payment link, or an EPC/SEPA transfer QR) need no backend.

## Dynamic QR codes

- **Editable destination.** Change where a printed code points without reprinting it. Needs the code to encode a short link we control: the URL shortener.
- **Scan statistics.** Count scans by date, device and place. Needs the same redirect, plus storage, and a privacy review before collecting anything.
- **Custom short link** (the competitor's "enlace corto personalizado" switch). Comes with the URL shortener.
- **Named, saved QR codes** (the competitor's "ponle nombre a tu código QR"). Without accounts there is nowhere to keep the name. A name could still set the download's file name without a backend.
