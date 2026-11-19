import { encodeEsteka } from "./content/esteka";
import type { ContentEncoding, EncodedContent, QrContent } from "./qr-content";

/**
 * The most a code may hold, in UTF-8 bytes: it keeps every code at version 25 or below at level Q,
 * small enough to scan from a sticker.
 */
export const MAX_PAYLOAD_BYTES = 1000;

const UTF8 = new TextEncoder();

/** Refuses a payload over `MAX_PAYLOAD_BYTES`, saying how many bytes to cut. */
export function limitPayload(encoded: EncodedContent): ContentEncoding {
	const excessBytes = UTF8.encode(encoded.payload).length - MAX_PAYLOAD_BYTES;
	if (excessBytes > 0) {
		return {
			status: "invalid",
			problems: [{ field: "payload", reason: "too-long", excessBytes }],
		};
	}
	return { status: "valid", encoded };
}

/** Turns what people filled in into the text the code holds, or says what is missing or wrong. */
export function encodeContent(content: QrContent): ContentEncoding {
	const result = encodeEsteka(content);
	return result.status === "valid" ? limitPayload(result.encoded) : result;
}
