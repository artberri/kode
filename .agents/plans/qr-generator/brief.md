# Brief: QR code generator

## Description

The first version of kode.eus: a landing page with a QR code generator that runs entirely in the browser, free and with no login. People paste a link, customise the frame, shapes and colours, and download the code as PNG, SVG or WebP. The page is built from the approved "A2" design, and the shared UI components are built from the KODE design system as the generator needs them.

## Sources

- [Page designs canvas](https://claude.ai/artifact/2wW9ukFJgUKkkZY7ozi2SA): artboard `AltLauburuGoxoa.dc.html` ("✓ A2") is the approved design. `Main.dc.html` is the earlier interactive prototype: its controls (tabs, shapes, colours, contrast warning, format picker) show the intended behaviour, but not the look.
- [KODE design system](https://claude.ai/artifact/F6S7WRQ3iMjcHHgbProwWe): tokens, brand book and the 16 components with their variants and guidelines.
- [arbela-frame.svg](./arbela-frame.svg): the clipboard ("Arbela") frame from the reference SVG the user supplied, which must be one of the frames.
- Reference generators the user shared as screenshots (not kept): QR Code Generator Pro (frame grid, "Customization" tab with dot, corner square and corner dot shapes) and qr.io (frame, shape and logo tabs, shape and colour pickers).

## Context

- Only URLs for now (http and https), no other QR content types.
- No top menu. The headline is "QR kodeak. Euskaraz. Doan." (from design B) and the paragraph under it is "Itsatsi esteka, jolastu markoarekin, formekin eta koloreekin, eta deskargatu. Konturik gabe, eta dena zure nabigatzailean." (from design C).
- Customisation (the A2 set):
    - frames: none, Etiketa, Zigilua, Arbela, Tiketa
    - dot shapes: square, round, smooth, diamond
    - corner frame and corner centre shapes: square, rounded, circle
    - colours: QR, background, frame and frame text, with presets
    - frame text of up to 16 characters
- Downloads: PNG, SVG and WebP. PNG and WebP at a fixed 1024 px. Where the browser can't encode WebP (Safari may silently return PNG), the WebP option is disabled with an explanation.
- UI: our own components on native HTML elements and Tailwind 4 tokens, no shadcn/ui or headless library. Each component is built only when the generator needs it, not as a separate design-system plan.
- Everything happens in the browser: no account, nothing stored, the link never leaves the device.
- The URL shortener and bio pages come later; keep routes and shared UI ready for them without building them.
