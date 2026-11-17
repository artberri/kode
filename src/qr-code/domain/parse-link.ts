export const MAX_LINK_LENGTH = 1000;

export type InvalidLinkReason = "scheme" | "host" | "spaces" | "too-long";

export type ParsedLink =
	| { readonly status: "empty" }
	| { readonly status: "invalid"; readonly reason: InvalidLinkReason }
	| { readonly status: "valid"; readonly link: string; readonly schemeAdded: boolean };

// A scheme is letters before a colon, unless digits follow it: "kode.eus:8080" is a host and port.
const SCHEME = /^[a-z][a-z0-9+.-]*:(?!\d)/iu;
const WHITESPACE = /\s/u;

export function parseLink(input: string): ParsedLink {
	const text = input.trim();
	if (text === "") {
		return { status: "empty" };
	}
	if (text.length > MAX_LINK_LENGTH) {
		return { status: "invalid", reason: "too-long" };
	}
	if (WHITESPACE.test(text)) {
		return { status: "invalid", reason: "spaces" };
	}

	const schemeAdded = !SCHEME.test(text);
	const url = URL.parse(schemeAdded ? `https://${text}` : text);
	if (url !== null && url.protocol !== "http:" && url.protocol !== "https:") {
		return { status: "invalid", reason: "scheme" };
	}
	if (url === null || !url.hostname.includes(".")) {
		return { status: "invalid", reason: "host" };
	}
	if (url.href.length > MAX_LINK_LENGTH) {
		return { status: "invalid", reason: "too-long" };
	}
	return { status: "valid", link: url.href, schemeAdded };
}
