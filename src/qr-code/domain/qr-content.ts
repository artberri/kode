import type { InvalidLinkReason } from "./parse-link";

/** Every kind of content a code can hold. Each slug also names the downloaded file. */
export const QR_CONTENT_TYPES = [
	"esteka",
	"testua",
	"telefonoa",
	"whatsapp",
	"sms",
	"posta",
	"wifi",
	"kontaktua",
	"ekitaldia",
	"kokapena",
	"sareak",
] as const;

export type QrContentType = (typeof QR_CONTENT_TYPES)[number];

/** What people filled in for one type, as they typed it. */
export type QrContent = { readonly type: "esteka"; readonly link: string };

/** The text a code holds, with what the UI needs to describe it, per type. */
export type EncodedContent = {
	readonly type: "esteka";
	readonly payload: string;
	/** The normalised link. */
	readonly link: string;
	readonly schemeAdded: boolean;
};

/** A field that is wrong, with a reason code; the UI words it. */
export type ContentProblem =
	| { readonly field: "link"; readonly reason: InvalidLinkReason }
	| { readonly field: "payload"; readonly reason: "too-long"; readonly excessBytes: number };

export type ContentEncoding =
	| { readonly status: "empty" }
	| { readonly status: "invalid"; readonly problems: readonly ContentProblem[] }
	| { readonly status: "valid"; readonly encoded: EncodedContent };
