import { describe, expect, it } from "vitest";

import { DEFAULT_DESIGN, type FrameStyle, type QrDesign } from "./qr-design";
import { FRAME_LAYOUTS, type LabelSlot, type OutlineFrameText } from "./qr-frames";
import type { QrMatrix } from "./qr-matrix";
import { renderQrSvg } from "./render-qr-svg";

const FRAMES: readonly FrameStyle[] = ["none", "label", "stamp", "clipboard", "ticket"];

/** A blank matrix with the given modules dark, as `[row, column]`. */
function matrixWith(size: number, dark: readonly (readonly [number, number])[] = []): QrMatrix {
	const on = new Set(dark.map(([row, column]) => `${row},${column}`));
	return Array.from({ length: size }, (_, row) =>
		Array.from({ length: size }, (_unused, column) => on.has(`${row},${column}`)),
	);
}

function design(overrides: Partial<QrDesign>): QrDesign {
	return { ...DEFAULT_DESIGN, ...overrides };
}

function attribute(svg: string, selector: RegExp, name: string): string {
	const element = selector.exec(svg)?.[0] ?? "";
	return new RegExp(`\\s${name}="([^"]*)"`, "u").exec(element)?.[1] ?? "";
}

function dotsPath(svg: string): string {
	return attribute(svg, /<path class="qr-dots"[^>]*>/u, "d");
}

function finderPath(svg: string): string {
	return attribute(svg, /<path class="qr-finders"[^>]*>/u, "d");
}

function fontSizeOf(svg: string): number {
	return Number(attribute(svg, /<text[^>]*>/u, "font-size"));
}

/** The modules' offset and module size, and the light area they sit on, from the markup. */
function quietZone(svg: string): {
	readonly area: { x: number; y: number; size: number; radius: number };
	readonly modules: { x: number; y: number; unit: number };
} {
	const areaTag = /<rect class="qr-area"[^>]*>/u;
	const transform = attribute(svg, /<g class="qr-modules"[^>]*>/u, "transform");
	const [, x = "", y = "", unit = ""] =
		/translate\(([\d.]+) ([\d.]+)\) scale\(([\d.]+)\)/u.exec(transform) ?? [];
	return {
		area: {
			x: Number(attribute(svg, areaTag, "x")),
			y: Number(attribute(svg, areaTag, "y")),
			size: Number(attribute(svg, areaTag, "width")),
			radius: Number(attribute(svg, areaTag, "rx")),
		},
		modules: { x: Number(x), y: Number(y), unit: Number(unit) },
	};
}

/** An outliner that draws the same path for any text, and remembers what it was asked. */
function outliner(): {
	readonly calls: { text: string; slot: LabelSlot }[];
	readonly outline: OutlineFrameText;
} {
	const calls: { text: string; slot: LabelSlot }[] = [];
	return {
		calls,
		outline: (text, slot) => {
			calls.push({ text, slot });
			return "M1 2H3V4Z";
		},
	};
}

describe("renderQrSvg", () => {
	it("returns a standalone SVG document", () => {
		const svg = renderQrSvg(matrixWith(21), DEFAULT_DESIGN);
		expect(svg).toMatch(
			/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg" viewBox="0 0 \d+ \d+"/u,
		);
		expect(svg).toMatch(/<\/svg>$/u);
	});

	describe("dots", () => {
		const one = matrixWith(21, [[10, 10]]);

		it("draws square dots as whole modules", () => {
			expect(dotsPath(renderQrSvg(one, design({ dots: "square" })))).toBe("M10 10h1v1h-1Z");
		});

		it("draws round dots as circles inside the module", () => {
			expect(dotsPath(renderQrSvg(one, design({ dots: "round" })))).toBe(
				"M10.5 10.08A0.42 0.42 0 0 1 10.92 10.5A0.42 0.42 0 0 1 10.5 10.92" +
					"A0.42 0.42 0 0 1 10.08 10.5A0.42 0.42 0 0 1 10.5 10.08Z",
			);
		});

		it("draws diamond dots corner to corner inside the module", () => {
			expect(dotsPath(renderQrSvg(one, design({ dots: "diamond" })))).toBe(
				"M10.5 10L11 10.5L10.5 11L10 10.5Z",
			);
		});

		it("rounds the outer corners of smooth dots and keeps the joins square", () => {
			const pair = matrixWith(21, [
				[10, 10],
				[10, 11],
			]);
			expect(dotsPath(renderQrSvg(pair, design({ dots: "smooth" })))).toBe(
				"M10.5 10H11V11H10.5A0.5 0.5 0 0 1 10 10.5A0.5 0.5 0 0 1 10.5 10Z" +
					"M11 10H11.5A0.5 0.5 0 0 1 12 10.5A0.5 0.5 0 0 1 11.5 11H11Z",
			);
		});

		it("leaves the finder patterns to their own shapes", () => {
			const inFinders = matrixWith(21, [
				[0, 0],
				[3, 17],
				[18, 2],
			]);
			expect(dotsPath(renderQrSvg(inFinders, design({ dots: "square" })))).toBe("");
		});
	});

	describe("finder patterns", () => {
		it("draws square rings and centres in each of the three corners", () => {
			const path = finderPath(
				renderQrSvg(matrixWith(21), design({ corner: "square", centre: "square" })),
			);
			expect(path).toContain("M0 0H7V7H0Z");
			expect(path).toContain("M14 0H21V7H14Z");
			expect(path).toContain("M0 14H7V21H0Z");
			expect(path).toContain("M1 1V6H6V1Z");
			expect(path).toContain("M2 2H5V5H2Z");
		});

		it("rounds the ring and the centre independently", () => {
			const rounded = finderPath(
				renderQrSvg(matrixWith(21), design({ corner: "rounded", centre: "square" })),
			);
			expect(rounded).toContain("M2.2 0H4.8A2.2 2.2 0 0 1 7 2.2");
			expect(rounded).toContain("M2 2H5V5H2Z");

			const circle = finderPath(
				renderQrSvg(matrixWith(21), design({ corner: "square", centre: "circle" })),
			);
			expect(circle).toContain("M0 0H7V7H0Z");
			expect(circle).toContain(
				"M3.5 2A1.5 1.5 0 0 1 5 3.5A1.5 1.5 0 0 1 3.5 5A1.5 1.5 0 0 1 2 3.5A1.5 1.5 0 0 1 3.5 2Z",
			);
		});

		it("draws circular rings", () => {
			const path = finderPath(renderQrSvg(matrixWith(21), design({ corner: "circle" })));
			expect(path).toContain(
				"M3.5 0A3.5 3.5 0 0 1 7 3.5A3.5 3.5 0 0 1 3.5 7A3.5 3.5 0 0 1 0 3.5A3.5 3.5 0 0 1 3.5 0Z",
			);
			expect(path).toContain(
				"M3.5 1A2.5 2.5 0 0 0 1 3.5A2.5 2.5 0 0 0 3.5 6A2.5 2.5 0 0 0 6 3.5A2.5 2.5 0 0 0 3.5 1Z",
			);
		});
	});

	describe("colours", () => {
		const colours = {
			qr: "#112233",
			background: "#FFFFEE",
			frame: "#445566",
			frameText: "#778899",
		} as const;

		it.each(FRAMES)("paints the %s frame in the chosen colours", (frame) => {
			const svg = renderQrSvg(matrixWith(21, [[10, 10]]), design({ frame, colours }));
			expect(attribute(svg, /<g class="qr-modules"[^>]*>/u, "fill")).toBe("#112233");
			expect(attribute(svg, /<rect class="qr-area"[^>]*>/u, "fill")).toBe("#FFFFEE");
		});

		it.each(FRAMES.filter((frame) => frame !== "none"))(
			"paints the %s frame and its text in their own colours",
			(frame) => {
				const svg = renderQrSvg(matrixWith(21), design({ frame, colours }));
				expect(attribute(svg, /<g class="qr-frame"[^>]*>/u, "fill")).toBe("#445566");
				expect(attribute(svg, /<text[^>]*>/u, "fill")).toBe("#778899");
			},
		);

		it("tints the clipboard's clip from the frame colour", () => {
			const svg = renderQrSvg(matrixWith(21), design({ frame: "clipboard", colours }));
			expect(svg).toContain('fill="#8F99A3"');
		});
	});

	describe("frame text", () => {
		it.each(FRAMES.filter((frame) => frame !== "none"))(
			"writes the text on the %s frame",
			(frame) => {
				const svg = renderQrSvg(matrixWith(21), design({ frame, frameText: "Menua" }));
				expect(svg).toMatch(/<text[^>]*>Menua<\/text>/u);
			},
		);

		it("draws no text without a frame", () => {
			const svg = renderQrSvg(matrixWith(21), design({ frame: "none", frameText: "Menua" }));
			expect(svg).not.toContain("<text");
			expect(svg).not.toContain("qr-frame");
		});

		it("draws no text when it is blank", () => {
			expect(renderQrSvg(matrixWith(21), design({ frameText: "  " }))).not.toContain("<text");
		});

		it("cuts the text to 16 characters", () => {
			const svg = renderQrSvg(
				matrixWith(21),
				design({ frameText: "Eskaneatu hau, mesedez" }),
			);
			expect(svg).toMatch(/<text[^>]*>Eskaneatu hau, m<\/text>/u);
		});

		it("escapes markup in the text", () => {
			const svg = renderQrSvg(matrixWith(21), design({ frameText: `<a & "b">` }));
			expect(svg).toMatch(/<text[^>]*>&lt;a &amp; &quot;b&quot;&gt;<\/text>/u);
		});

		it("shrinks long text so it fits the frame", () => {
			const short = renderQrSvg(matrixWith(21), design({ frameText: "Kaixo" }));
			const long = renderQrSvg(matrixWith(21), design({ frameText: "Eskaneatu hemen!" }));
			expect(fontSizeOf(long)).toBeLessThan(fontSizeOf(short));
		});
	});

	describe("frame text as outlines", () => {
		it.each(FRAMES.filter((frame) => frame !== "none"))(
			"draws the text on the %s frame as a path in the text colour, at its label slot",
			(frame) => {
				const { calls, outline } = outliner();
				const svg = renderQrSvg(matrixWith(21), design({ frame, frameText: "Menua" }), {
					outlineFrameText: outline,
				});

				expect(svg).toContain('<path class="qr-label" fill="#FFFFFF" d="M1 2H3V4Z"/>');
				expect(svg).not.toContain("<text");
				expect(calls).toEqual([{ text: "Menua", slot: FRAME_LAYOUTS[frame].label }]);
			},
		);

		it("passes the text cut to 16 characters", () => {
			const { calls, outline } = outliner();
			renderQrSvg(matrixWith(21), design({ frameText: "Eskaneatu hau, mesedez" }), {
				outlineFrameText: outline,
			});

			expect(calls.map((call) => call.text)).toEqual(["Eskaneatu hau, m"]);
		});

		it.each([
			{ case: "without a frame", overrides: { frame: "none", frameText: "Menua" } },
			{ case: "when the text is blank", overrides: { frameText: "  " } },
		] as const)("draws no label $case", ({ overrides }) => {
			const { calls, outline } = outliner();
			const svg = renderQrSvg(matrixWith(21), design(overrides), {
				outlineFrameText: outline,
			});

			expect(svg).not.toContain("qr-label");
			expect(calls).toEqual([]);
		});

		it("draws no label when the outliner has nothing to draw", () => {
			const svg = renderQrSvg(matrixWith(21), design({ frameText: "🙂" }), {
				outlineFrameText: () => "",
			});

			expect(svg).not.toContain("qr-label");
			expect(svg).not.toContain("<text");
		});
	});

	describe("quiet zone", () => {
		it.each(FRAMES.flatMap((frame) => [21, 57, 177].map((size) => ({ frame, size }))))(
			"keeps four light modules around a $size-module code in the $frame frame",
			({ frame, size }) => {
				const { area, modules } = quietZone(
					renderQrSvg(matrixWith(size), design({ frame })),
				);
				const quiet = 4 * modules.unit;
				const tolerance = 1e-3;
				expect(modules.x - area.x).toBeGreaterThanOrEqual(quiet - tolerance);
				expect(modules.y - area.y).toBeGreaterThanOrEqual(quiet - tolerance);
				expect(
					area.x + area.size - (modules.x + size * modules.unit),
				).toBeGreaterThanOrEqual(quiet - tolerance);
				expect(
					area.y + area.size - (modules.y + size * modules.unit),
				).toBeGreaterThanOrEqual(quiet - tolerance);
				// A rounded corner no larger than the quiet zone stays four modules from every module.
				expect(area.radius).toBeLessThanOrEqual(quiet + tolerance);
			},
		);
	});
});
