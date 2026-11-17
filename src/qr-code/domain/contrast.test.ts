import { describe, expect, it } from "vitest";

import { contrastOf } from "./contrast";

describe("contrastOf", () => {
	it("is ok for a dark QR on a light background", () => {
		expect(contrastOf("#2A1740", "#FFFFFF")).toBe("ok");
		expect(contrastOf("#000000", "#FFE58F")).toBe("ok");
	});

	it("is ok at exactly 3:1", () => {
		// #949494 on white is 3.03:1; #959595 is 2.99:1.
		expect(contrastOf("#949494", "#FFFFFF")).toBe("ok");
	});

	it("is low below 3:1", () => {
		expect(contrastOf("#959595", "#FFFFFF")).toBe("low");
		expect(contrastOf("#CDB8FF", "#FFFFFF")).toBe("low");
		expect(contrastOf("#FFFFFF", "#FFFFFF")).toBe("low");
	});

	it("is inverted when the QR is lighter than the background", () => {
		expect(contrastOf("#FFFFFF", "#2A1740")).toBe("inverted");
		expect(contrastOf("#FFE58F", "#000000")).toBe("inverted");
	});

	it("calls a light QR on a slightly lighter background low, not inverted", () => {
		expect(contrastOf("#FFFFFF", "#F0F0F0")).toBe("low");
	});

	it("reads lowercase hex", () => {
		expect(contrastOf("#2a1740", "#ffffff")).toBe("ok");
	});
});
