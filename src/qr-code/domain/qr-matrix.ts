/** The modules of a QR code, row by row: `true` is a dark module. Always square. */
export type QrMatrix = readonly (readonly boolean[])[];

/** The 7 × 7 finder patterns sit in the top-left, top-right and bottom-left corners. */
export const FINDER_SIZE = 7;

export function isInFinder(row: number, column: number, size: number): boolean {
	const top = row < FINDER_SIZE;
	const left = column < FINDER_SIZE;
	return (
		(top && left) ||
		(top && column >= size - FINDER_SIZE) ||
		(left && row >= size - FINDER_SIZE)
	);
}
