import { describe, expect, it } from "vitest";

import { encodeContent, limitPayload, MAX_PAYLOAD_BYTES } from "./encode-content";
import { MAX_LINK_LENGTH } from "./parse-link";
import type { ContentEncoding } from "./qr-content";

function encoded(payload: string) {
	return { type: "esteka", payload, link: payload, schemeAdded: false } as const;
}

function payloadOf(result: ContentEncoding): string {
	if (result.status !== "valid") {
		throw new Error(`Expected valid content, got ${result.status}`);
	}
	return result.encoded.payload;
}

describe("encodeContent", () => {
	it("encodes a link as its normalised form", () => {
		expect(encodeContent({ type: "esteka", link: "kode.eus/menua" })).toEqual({
			status: "valid",
			encoded: {
				type: "esteka",
				payload: "https://kode.eus/menua",
				link: "https://kode.eus/menua",
				schemeAdded: true,
			},
		});
	});

	it("waits for a link while it is blank", () => {
		expect(encodeContent({ type: "esteka", link: "  " })).toEqual({ status: "empty" });
	});

	it("names the link as the wrong field, with the reason", () => {
		expect(encodeContent({ type: "esteka", link: "ftp://kode.eus/" })).toEqual({
			status: "invalid",
			problems: [{ field: "link", reason: "scheme" }],
		});
	});

	it("keeps every valid link within the byte limit, as new URL percent-encodes it", () => {
		expect(MAX_LINK_LENGTH).toBe(MAX_PAYLOAD_BYTES);
		const base = "https://kode.eus/";
		// Each ñ becomes %C3%B1, six characters, so this link sits just under the length limit.
		const accented = `${base}${"ñ".repeat(Math.floor((MAX_LINK_LENGTH - base.length) / 6))}`;

		const payload = payloadOf(encodeContent({ type: "esteka", link: accented }));

		expect(payload).toMatch(/^[ -~]+$/u);
		expect(new TextEncoder().encode(payload).length).toBeLessThanOrEqual(MAX_PAYLOAD_BYTES);
	});
});

describe("limitPayload", () => {
	it("keeps a payload of exactly 1000 bytes", () => {
		const atLimit = encoded("a".repeat(MAX_PAYLOAD_BYTES));
		expect(limitPayload(atLimit)).toEqual({ status: "valid", encoded: atLimit });
	});

	it("counts UTF-8 bytes, so ñ counts as two, and says how many bytes to cut", () => {
		const payload = `${"a".repeat(MAX_PAYLOAD_BYTES - 2)}ññ`;
		expect(payload).toHaveLength(MAX_PAYLOAD_BYTES);
		expect(limitPayload(encoded(payload))).toEqual({
			status: "invalid",
			problems: [{ field: "payload", reason: "too-long", excessBytes: 2 }],
		});
	});
});
