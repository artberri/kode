import type { CornerStyle, DotStyle } from "./qr-design";
import { FINDER_SIZE, isInFinder, type QrMatrix } from "./qr-matrix";
import { num, type Radii, roundedRect } from "./svg-path";

const ROUND_DOT_INSET = 0.08;
const HALF = 0.5;

function isDark(matrix: QrMatrix, row: number, column: number): boolean {
	return matrix[row]?.[column] === true && !isInFinder(row, column, matrix.length);
}

function cornerRadius(neighbourA: boolean, neighbourB: boolean): number {
	return neighbourA || neighbourB ? 0 : HALF;
}

/** Rounds only the corners where the dot has no dark neighbour on either side. */
function smoothRadii(matrix: QrMatrix, row: number, column: number): Radii {
	const above = isDark(matrix, row - 1, column);
	const below = isDark(matrix, row + 1, column);
	const left = isDark(matrix, row, column - 1);
	const right = isDark(matrix, row, column + 1);
	return [
		cornerRadius(above, left),
		cornerRadius(above, right),
		cornerRadius(below, right),
		cornerRadius(below, left),
	];
}

type DotDrawer = (matrix: QrMatrix, row: number, column: number) => string;

const ROUND_DOT_SIZE = 1 - ROUND_DOT_INSET * 2;

const DOTS: Record<DotStyle, DotDrawer> = {
	square: (_matrix, row, column) => `M${String(column)} ${String(row)}h1v1h-1Z`,
	round: (_matrix, row, column) =>
		roundedRect(
			{
				x: column + ROUND_DOT_INSET,
				y: row + ROUND_DOT_INSET,
				width: ROUND_DOT_SIZE,
				height: ROUND_DOT_SIZE,
			},
			[ROUND_DOT_SIZE / 2, ROUND_DOT_SIZE / 2, ROUND_DOT_SIZE / 2, ROUND_DOT_SIZE / 2],
		),
	smooth: (matrix, row, column) =>
		roundedRect({ x: column, y: row, width: 1, height: 1 }, smoothRadii(matrix, row, column)),
	diamond: (_matrix, row, column) =>
		`M${num(column + HALF)} ${String(row)}L${String(column + 1)} ${num(row + HALF)}` +
		`L${num(column + HALF)} ${String(row + 1)}L${String(column)} ${num(row + HALF)}Z`,
};

/** Every dark module outside the finder patterns, in module units, as one path. */
export function dotsPath(matrix: QrMatrix, style: DotStyle): string {
	const draw = DOTS[style];
	let d = "";
	matrix.forEach((cells, row) => {
		cells.forEach((_, column) => {
			if (isDark(matrix, row, column)) {
				d += draw(matrix, row, column);
			}
		});
	});
	return d;
}

const RING_RADII: Record<CornerStyle, { readonly outer: number; readonly inner: number }> = {
	square: { outer: 0, inner: 0 },
	rounded: { outer: 2.2, inner: 1.4 },
	circle: { outer: 3.5, inner: 2.5 },
};

const CENTRE_RADIUS: Record<CornerStyle, number> = { square: 0, rounded: 0.9, circle: 1.5 };

function all(radius: number): Radii {
	return [radius, radius, radius, radius];
}

function finder(x: number, y: number, corner: CornerStyle, centre: CornerStyle): string {
	const { outer, inner } = RING_RADII[corner];
	return (
		roundedRect({ x, y, width: FINDER_SIZE, height: FINDER_SIZE }, all(outer)) +
		roundedRect({ x: x + 1, y: y + 1, width: 5, height: 5 }, all(inner), true) +
		roundedRect({ x: x + 2, y: y + 2, width: 3, height: 3 }, all(CENTRE_RADIUS[centre]))
	);
}

/** The three finder patterns, in module units, as one path: ring, hole and centre each. */
export function finderPath(size: number, corner: CornerStyle, centre: CornerStyle): string {
	const far = size - FINDER_SIZE;
	return (
		finder(0, 0, corner, centre) +
		finder(far, 0, corner, centre) +
		finder(0, far, corner, centre)
	);
}
