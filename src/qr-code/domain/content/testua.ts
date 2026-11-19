import type { ContentEncoding, QrContent } from "../qr-content";

/** A text, held exactly as typed: the scanner shows it. Only whitespace counts as empty. */
export function encodeTestua({ text }: Extract<QrContent, { type: "testua" }>): ContentEncoding {
	if (text.trim() === "") {
		return { status: "empty" };
	}
	return { status: "valid", encoded: { type: "testua", payload: text } };
}
