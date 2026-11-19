import type { InvalidLinkReason } from "./parse-link";

/** Every kind of content a code can hold, in the order the page offers them. */
export const QR_CONTENT_TYPES = [
	"link",
	"text",
	"phone",
	"whatsapp",
	"sms",
	"email",
	"wifi",
	"contact",
	"event",
	"location",
	"social",
] as const;

export type QrContentType = (typeof QR_CONTENT_TYPES)[number];

/** Each type as people see it in the downloaded file's name: `kode-esteka.png`. */
export const DOWNLOAD_NAMES: Readonly<Record<QrContentType, string>> = {
	link: "esteka",
	text: "testua",
	phone: "telefonoa",
	whatsapp: "whatsapp",
	sms: "sms",
	email: "posta",
	wifi: "wifi",
	contact: "kontaktua",
	event: "ekitaldia",
	location: "kokapena",
	social: "sareak",
};

/** What people filled in for one type, as they typed it. */
export type QrContent =
	| { readonly type: "link"; readonly link: string }
	| { readonly type: "text"; readonly text: string };

/** The content of one type. */
export type ContentOf<Type extends QrContent["type"]> = Extract<QrContent, { type: Type }>;

/** The text a code holds, with what the UI needs to describe it, per type. */
export type EncodedContent =
	| {
			readonly type: "link";
			readonly payload: string;
			/** The normalised link. */
			readonly link: string;
			readonly schemeAdded: boolean;
	  }
	| { readonly type: "text"; readonly payload: string };

/** A field that is wrong, with a reason code; the UI words it. */
export type ContentProblem =
	| { readonly field: "link"; readonly reason: InvalidLinkReason }
	| { readonly field: "payload"; readonly reason: "too-long"; readonly excessBytes: number };

export type ContentEncoding =
	| { readonly status: "empty" }
	| { readonly status: "invalid"; readonly problems: readonly ContentProblem[] }
	| { readonly status: "valid"; readonly encoded: EncodedContent };
