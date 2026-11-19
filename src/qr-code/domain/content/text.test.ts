import { describe, expect, it } from "vitest";

import { encodeText } from "./text";

describe("encodeText", () => {
	it("holds the text itself as the payload", () => {
		expect(encodeText({ type: "text", text: "Kaixo, Goñi!" })).toEqual({
			status: "valid",
			encoded: { type: "text", payload: "Kaixo, Goñi!" },
		});
	});

	it("keeps line breaks and the spaces around the text", () => {
		const text = "  Lehen lerroa\r\nBigarrena\n";
		expect(encodeText({ type: "text", text })).toMatchObject({
			encoded: { payload: text },
		});
	});

	it.each(["", " ", "\n\t "])("counts %j as empty", (text) => {
		expect(encodeText({ type: "text", text })).toEqual({ status: "empty" });
	});
});
