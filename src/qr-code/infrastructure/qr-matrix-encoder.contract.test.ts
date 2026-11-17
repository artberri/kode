import jsQR from "jsqr";
import { describe, expect, it } from "vitest";

import type { QrMatrixEncoder } from "../application/qr-matrix-encoder";
import type { QrMatrix } from "../domain/qr-matrix";
import { FixedMatrixEncoder } from "./fixed-matrix-encoder";
import { QrcodeGeneratorEncoder } from "./qrcode-generator-encoder";

const SHORT_LINK = "https://kode.eus/";
const LINKS = [
	SHORT_LINK,
	"http://kode.eus/menua?mahaia=4#postreak",
	`https://kode.eus/${"a".repeat(983)}`,
];

const FINDER = ["1111111", "1000001", "1011101", "1011101", "1011101", "1000001", "1111111"].map(
	(row) => Array.from(row, (cell) => cell === "1"),
);

function regionAt(matrix: QrMatrix, top: number, left: number): boolean[][] {
	return matrix.slice(top, top + 7).map((row) => row.slice(left, left + 7));
}

/** Draws the matrix as RGBA pixels, with a four-module quiet zone, for jsQR to read. */
function toImage(matrix: QrMatrix, scale = 4): { data: Uint8ClampedArray; size: number } {
	const quiet = 4;
	const size = (matrix.length + quiet * 2) * scale;
	const data = new Uint8ClampedArray(size * size * 4).fill(255);
	matrix.forEach((row, r) => {
		row.forEach((dark, c) => {
			if (!dark) {
				return;
			}
			for (let y = 0; y < scale; y += 1) {
				for (let x = 0; x < scale; x += 1) {
					const offset = (((r + quiet) * scale + y) * size + (c + quiet) * scale + x) * 4;
					data.fill(0, offset, offset + 3);
				}
			}
		});
	});
	return { data, size };
}

describe.each([
	{ name: "FixedMatrixEncoder", create: (): QrMatrixEncoder => new FixedMatrixEncoder() },
	{ name: "QrcodeGeneratorEncoder", create: (): QrMatrixEncoder => new QrcodeGeneratorEncoder() },
])("QrMatrixEncoder contract: $name", ({ create }) => {
	it.each(LINKS)("encodes %s as a square, odd-sized matrix of at least 21 modules", (link) => {
		const matrix = create().encode(link);
		expect(matrix.length).toBeGreaterThanOrEqual(21);
		expect(matrix.length % 2).toBe(1);
		for (const row of matrix) {
			expect(row).toHaveLength(matrix.length);
		}
	});

	it("puts a finder pattern in the top-left, top-right and bottom-left corners", () => {
		const matrix = create().encode(SHORT_LINK);
		const far = matrix.length - 7;
		expect(regionAt(matrix, 0, 0)).toEqual(FINDER);
		expect(regionAt(matrix, 0, far)).toEqual(FINDER);
		expect(regionAt(matrix, far, 0)).toEqual(FINDER);
	});
});

describe("QrcodeGeneratorEncoder", () => {
	it.each(LINKS)("encodes %s so a reader decodes it back", (link) => {
		const { data, size } = toImage(new QrcodeGeneratorEncoder().encode(link));
		expect(jsQR(data, size, size)?.data).toBe(link);
	});
});
