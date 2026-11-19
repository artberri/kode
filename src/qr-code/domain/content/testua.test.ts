import { describe, expect, it } from "vitest";

import { encodeTestua } from "./testua";

describe("encodeTestua", () => {
	it("holds the text itself as the payload", () => {
		expect(encodeTestua({ type: "testua", text: "Kaixo, Goñi!" })).toEqual({
			status: "valid",
			encoded: { type: "testua", payload: "Kaixo, Goñi!" },
		});
	});

	it("keeps line breaks and the spaces around the text", () => {
		const text = "  Lehen lerroa\r\nBigarrena\n";
		expect(encodeTestua({ type: "testua", text })).toMatchObject({
			encoded: { payload: text },
		});
	});

	it.each(["", " ", "\n\t "])("counts %j as empty", (text) => {
		expect(encodeTestua({ type: "testua", text })).toEqual({ status: "empty" });
	});
});
