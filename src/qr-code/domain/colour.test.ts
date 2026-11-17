import { describe, expect, it } from "vitest";

import { isHexColor } from "./colour";

describe("isHexColor", () => {
	it.each(["#2A1740", "#2a1740", "#FFFFFF"])("accepts %s", (text) => {
		expect(isHexColor(text)).toBe(true);
	});

	it.each(["2A1740", "#FFF", "#2A17400", "#GGGGGG", "", "red"])("rejects %j", (text) => {
		expect(isHexColor(text)).toBe(false);
	});
});
