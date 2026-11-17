import { describe, expect, it } from "vitest";

import type { CornerStyle } from "./qr-design";
import { dotsPath, finderCentrePath, finderPath, finderRingPath } from "./qr-shapes";

const DIAGONAL = [
	[true, false],
	[false, true],
];

describe("dotsPath", () => {
	it("leaves out the modules where the finder patterns go", () => {
		expect(dotsPath(DIAGONAL, "square")).toBe("");
	});

	it("draws every dark module when asked to keep the finder modules, as for a sample tile", () => {
		expect(dotsPath(DIAGONAL, "square", { skipFinders: false })).toBe(
			"M0 0h1v1h-1ZM1 1h1v1h-1Z",
		);
	});
});

describe("finder parts", () => {
	it.each([
		["square", "square"],
		["rounded", "circle"],
		["circle", "rounded"],
	] as const satisfies readonly (readonly [CornerStyle, CornerStyle])[])(
		"draws a %s ring and a %s centre as the finder patterns are drawn",
		(corner, centre) => {
			expect(
				finderPath(21, corner, centre).startsWith(
					finderRingPath(0, 0, corner) + finderCentrePath(0, 0, centre),
				),
			).toBe(true);
		},
	);
});
