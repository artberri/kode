import type { QrMatrixEncoder } from "../application/qr-matrix-encoder";
import { FINDER_SIZE, isInFinder, type QrMatrix } from "../domain/qr-matrix";

const SIZE = 21;

function finderModule(row: number, column: number): boolean {
	const ring = Math.max(Math.abs(row - 3), Math.abs(column - 3));
	return ring !== 2;
}

function fixedModule(row: number, column: number): boolean {
	if (isInFinder(row, column, SIZE)) {
		return finderModule(row % (SIZE - FINDER_SIZE), column % (SIZE - FINDER_SIZE));
	}
	if (row === FINDER_SIZE || column === FINDER_SIZE) {
		return false;
	}
	if (row === 6 || column === 6) {
		return (row + column) % 2 === 0;
	}
	return (row * 7 + column * 3) % 5 < 2;
}

/**
 * An in-memory encoder that returns the same version-1-sized matrix for any text, with real finder
 * and timing patterns, and remembers what it was asked to encode.
 */
export class FixedMatrixEncoder implements QrMatrixEncoder {
	readonly encoded: string[] = [];

	encode(text: string): QrMatrix {
		this.encoded.push(text);
		return Array.from({ length: SIZE }, (_, row) =>
			Array.from({ length: SIZE }, (_unused, column) => fixedModule(row, column)),
		);
	}
}
