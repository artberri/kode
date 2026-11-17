import type { CornerStyle, DotStyle } from "./qr-design";
import { FINDER_SIZE, isInFinder, type QrMatrix } from "./qr-matrix";
import { num, type Radii, roundedRect } from "./svg-path";

const ROUND_DOT_INSET = 0.08;
const HALF = 0.5;

/** Whether the module at a row and column is drawn as a dot. */
type Darkness = (row: number, column: number) => boolean;

function cornerRadius(neighbourA: boolean, neighbourB: boolean): number {
	return neighbourA || neighbourB ? 0 : HALF;
}

/** Rounds only the corners where the dot has no dark neighbour on either side. */
function smoothRadii(isDark: Darkness, row: number, column: number): Radii {
	const above = isDark(row - 1, column);
	const below = isDark(row + 1, column);
	const left = isDark(row, column - 1);
	const right = isDark(row, column + 1);
	return [
		cornerRadius(above, left),
		cornerRadius(above, right),
		cornerRadius(below, right),
		cornerRadius(below, left),
	];
}

type DotDrawer = (isDark: Darkness, row: number, column: number) => string;

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
	smooth: (isDark, row, column) =>
		roundedRect({ x: column, y: row, width: 1, height: 1 }, smoothRadii(isDark, row, column)),
	diamond: (_matrix, row, column) =>
		`M${num(column + HALF)} ${String(row)}L${String(column + 1)} ${num(row + HALF)}` +
		`L${num(column + HALF)} ${String(row + 1)}L${String(column)} ${num(row + HALF)}Z`,
};

export interface DotsOptions {
	/** Leave out the modules where the finder patterns go. Off only for a sample drawing. */
	readonly skipFinders?: boolean;
}

/** Every dark module outside the finder patterns, in module units, as one path. */
export function dotsPath(
	matrix: QrMatrix,
	style: DotStyle,
	{ skipFinders = true }: DotsOptions = {},
): string {
	const draw = DOTS[style];
	const isDark: Darkness = (row, column) =>
		matrix[row]?.[column] === true && !(skipFinders && isInFinder(row, column, matrix.length));
	let d = "";
	matrix.forEach((cells, row) => {
		cells.forEach((_, column) => {
			if (isDark(row, column)) {
				d += draw(isDark, row, column);
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

/** A finder pattern's 7-module ring, with its 5-module hole, from its top-left corner. */
export function finderRingPath(x: number, y: number, corner: CornerStyle): string {
	const { outer, inner } = RING_RADII[corner];
	return (
		roundedRect({ x, y, width: FINDER_SIZE, height: FINDER_SIZE }, all(outer)) +
		roundedRect({ x: x + 1, y: y + 1, width: 5, height: 5 }, all(inner), true)
	);
}

/** A finder pattern's 3-module centre, from the pattern's top-left corner. */
export function finderCentrePath(x: number, y: number, centre: CornerStyle): string {
	return roundedRect({ x: x + 2, y: y + 2, width: 3, height: 3 }, all(CENTRE_RADIUS[centre]));
}

function finder(x: number, y: number, corner: CornerStyle, centre: CornerStyle): string {
	return finderRingPath(x, y, corner) + finderCentrePath(x, y, centre);
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
