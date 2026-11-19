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
export type QrContent =
	| { readonly type: "esteka"; readonly link: string }
	| { readonly type: "testua"; readonly text: string };

/** The content of one type. */
export type ContentOf<Type extends QrContent["type"]> = Extract<QrContent, { type: Type }>;

/** The text a code holds, with what the UI needs to describe it, per type. */
export type EncodedContent =
	| {
			readonly type: "esteka";
			readonly payload: string;
			/** The normalised link. */
			readonly link: string;
			readonly schemeAdded: boolean;
	  }
	| { readonly type: "testua"; readonly payload: string };

/** A field that is wrong, with a reason code; the UI words it. */
export type ContentProblem =
	| { readonly field: "link"; readonly reason: InvalidLinkReason }
	| { readonly field: "payload"; readonly reason: "too-long"; readonly excessBytes: number };

export type ContentEncoding =
	| { readonly status: "empty" }
	| { readonly status: "invalid"; readonly problems: readonly ContentProblem[] }
	| { readonly status: "valid"; readonly encoded: EncodedContent };
