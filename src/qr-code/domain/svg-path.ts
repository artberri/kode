/** Rounds to three decimals and drops trailing zeros, to keep the markup small. */
export function num(value: number): string {
	return String(Math.round(value * 1000) / 1000);
}

export interface Box {
	readonly x: number;
	readonly y: number;
	readonly width: number;
	readonly height: number;
}

/** Corner radii, clockwise from the top left. */
export type Radii = readonly [number, number, number, number];

/**
 * A rectangle with each corner rounded on its own, as one closed subpath. Counter-clockwise
 * subpaths cut holes out of clockwise ones under the default nonzero fill rule.
 */
export function roundedRect(box: Box, radii: Radii, counterClockwise = false): string {
	const { x, y, width: w, height: h } = box;
	const limit = Math.min(w, h) / 2;
	const tl = Math.min(radii[0], limit);
	const tr = Math.min(radii[1], limit);
	const br = Math.min(radii[2], limit);
	const bl = Math.min(radii[3], limit);
	// Corners in drawing order, each as: the point where the straight edge ends, and the radius.
	const corners: readonly { readonly from: Point; readonly to: Point; readonly r: number }[] =
		counterClockwise
			? [
					{ from: [x + tl, y], to: [x, y + tl], r: tl },
					{ from: [x, y + h - bl], to: [x + bl, y + h], r: bl },
					{ from: [x + w - br, y + h], to: [x + w, y + h - br], r: br },
					{ from: [x + w, y + tr], to: [x + w - tr, y], r: tr },
				]
			: [
					{ from: [x + w - tr, y], to: [x + w, y + tr], r: tr },
					{ from: [x + w, y + h - br], to: [x + w - br, y + h], r: br },
					{ from: [x + bl, y + h], to: [x, y + h - bl], r: bl },
					{ from: [x, y + tl], to: [x + tl, y], r: tl },
				];
	const start: Point = [x + tl, y];
	const sweep = counterClockwise ? 0 : 1;
	let d = `M${num(start[0])} ${num(start[1])}`;
	let at: Point = start;
	corners.forEach(({ from, to, r }, index) => {
		// A last straight edge back to the start is left to Z.
		const returnsToStart = index === corners.length - 1 && samePoint(from, start);
		if (!returnsToStart) {
			d += lineTo(at, from);
		}
		if (r > 0) {
			d += `A${num(r)} ${num(r)} 0 0 ${String(sweep)} ${num(to[0])} ${num(to[1])}`;
		}
		at = to;
	});
	return `${d}Z`;
}

type Point = readonly [number, number];

/** Compares points as they will be written, so floating-point noise adds no segments. */
function samePoint(a: Point, b: Point): boolean {
	return num(a[0]) === num(b[0]) && num(a[1]) === num(b[1]);
}

function lineTo(from: Point, to: Point): string {
	const sameX = num(from[0]) === num(to[0]);
	const sameY = num(from[1]) === num(to[1]);
	if (sameX && sameY) {
		return "";
	}
	if (sameY) {
		return `H${num(to[0])}`;
	}
	if (sameX) {
		return `V${num(to[1])}`;
	}
	return `L${num(to[0])} ${num(to[1])}`;
}
