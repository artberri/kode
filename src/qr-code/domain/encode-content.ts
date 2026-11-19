import { encodeLink } from "./content/link";
import { encodeText } from "./content/text";
import type { ContentEncoding, ContentOf, EncodedContent, QrContent } from "./qr-content";

/**
 * The most a code may hold, in UTF-8 bytes, the same as the link limit. At level Q that is up to
 * version 31 (141 modules); version 25 (117 modules) stops at 715 bytes.
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
	const result = encodeByType(content.type, content);
	return result.status === "valid" ? limitPayload(result.encoded) : result;
}

/** One encoder per type, so adding a type is one line here. */
const ENCODERS: {
	readonly [Type in QrContent["type"]]: (content: ContentOf<Type>) => ContentEncoding;
} = { link: encodeLink, text: encodeText };

function encodeByType<Type extends QrContent["type"]>(
	type: Type,
	content: ContentOf<Type>,
): ContentEncoding {
	return ENCODERS[type](content);
}
