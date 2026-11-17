import { describe, expect, it } from "vitest";

import { contrastOf } from "./contrast";
import { PALETTE_PRESETS, presetMatching } from "./palette-presets";
import { DEFAULT_DESIGN } from "./qr-design";

describe("PALETTE_PRESETS", () => {
	it("offers the six design-system palettes, in order", () => {
		expect(PALETTE_PRESETS.map((preset) => preset.name)).toEqual([
			"Morea",
			"Lila",
			"Menda",
			"Mertxikia",
			"Gurina",
			"Gaua",
		]);
	});

	it.each(PALETTE_PRESETS)("keeps the QR dark on a light background in $name", ({ colours }) => {
		expect(contrastOf(colours.qr, colours.background)).toBe("ok");
	});
});

describe("presetMatching", () => {
	it.each(PALETTE_PRESETS)("finds $name from its own four colours", ({ id, colours }) => {
		expect(presetMatching(colours)).toBe(id);
	});

	it("matches the default design to Morea", () => {
		expect(presetMatching(DEFAULT_DESIGN.colours)).toBe("morea");
	});

	it("ignores the case of the hex digits, as colour inputs give lowercase", () => {
		expect(
			presetMatching({
				qr: "#2a1740",
				background: "#ffffff",
				frame: "#6b3fa8",
				frameText: "#ffffff",
			}),
		).toBe("morea");
	});

	it("matches none once any one colour differs", () => {
		expect(presetMatching({ ...DEFAULT_DESIGN.colours, frameText: "#FFFFFE" })).toBeUndefined();
	});
});
