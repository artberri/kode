import { tint } from "./colour";
import type { FrameStyle, QrColours } from "./qr-design";

/** A square where the QR code and its quiet zone go, in the frame's own units. */
export interface QrArea {
	readonly x: number;
	readonly y: number;
	readonly size: number;
	/** The corner radius the design asks for; the renderer caps it to the quiet zone. */
	readonly radius: number;
}

/** Where the frame text goes: centred on `x`, its middle on `y`. */
export interface LabelSlot {
	readonly x: number;
	readonly y: number;
	readonly maxWidth: number;
	readonly fontSize: number;
}

/**
 * Draws frame text as SVG path data, in the frame's units: centred on the slot's `x`, its middle on
 * `y`, no wider than `maxWidth` and no larger than `fontSize`. Characters it can't draw are left
 * out; text with none it can draw gives "".
 */
export type OutlineFrameText = (text: string, slot: LabelSlot) => string;

export interface FrameLayout {
	readonly width: number;
	readonly height: number;
	readonly qrArea: QrArea;
	/** Markup drawn behind the QR area, inside a group filled with the frame colour. */
	readonly body?: (colours: QrColours) => string;
	readonly label?: LabelSlot;
}

const CLIPBOARD_CLIP_TINT = 0.4;

function ticketBody(): string {
	const width = 300;
	const toothWidth = 25;
	const top = 378;
	const bottom = 392;
	let teeth = "";
	for (let x = width; x > 0; x -= toothWidth) {
		teeth += `L${String(x - toothWidth / 2)} ${String(bottom)}L${String(x - toothWidth)} ${String(top)}`;
	}
	return `<path d="M12 0H288A12 12 0 0 1 300 12V${String(top)}${teeth}V12A12 12 0 0 1 12 0Z"/>`;
}

/**
 * The five frames, drawn after the A2 design's tiles. Arbela keeps the exact paths of the
 * reference clipboard (`.agents/plans/qr-generator/arbela-frame.svg`).
 */
export const FRAME_LAYOUTS: Record<FrameStyle, FrameLayout> = {
	none: {
		width: 300,
		height: 300,
		qrArea: { x: 0, y: 0, size: 300, radius: 0 },
	},
	label: {
		width: 300,
		height: 372,
		qrArea: { x: 14, y: 14, size: 272, radius: 18 },
		body: () => '<rect width="300" height="372" rx="28"/>',
		label: { x: 150, y: 329, maxWidth: 256, fontSize: 36 },
	},
	stamp: {
		width: 300,
		height: 384,
		qrArea: { x: 8, y: 8, size: 284, radius: 26 },
		body: ({ background }) =>
			'<rect width="300" height="384" rx="34"/>' +
			`<path d="M24 306H276" fill="none" stroke="${background}" stroke-width="3" stroke-dasharray="8 7" stroke-linecap="round"/>`,
		label: { x: 150, y: 345, maxWidth: 260, fontSize: 34 },
	},
	clipboard: {
		width: 320,
		height: 418,
		// The clip hangs over the board's top edge, so the QR area starts below it.
		qrArea: { x: 22.15, y: 68.4, size: 275.7, radius: 0 },
		body: ({ background, frame }) =>
			`<rect x="17.3" y="58.8" width="285.4" height="285.3" fill="${background}"/>` +
			'<path d="M302.7 58.8v285.3H17.3V58.8zm0-12.4H17.3c-6.9 0-12.4 5.6-12.4 12.4v285.3c0 6.9 5.6 12.4 12.4 12.4h285.3c6.9 0 12.4-5.6 12.4-12.4V58.8c.1-6.8-5.5-12.4-12.3-12.4"/>' +
			'<path d="M302.7 410.5H17.3c-6.9 0-12.4-5.6-12.4-12.4v-53.7H315v53.7c.1 6.8-5.5 12.4-12.3 12.4"/>' +
			`<path fill="${tint(frame, CLIPBOARD_CLIP_TINT)}" d="M115.8 27.9h89c11.7 0 21.2 9.5 21.2 21.2v15.2c0 2.3-1.8 4.1-4.1 4.1H98.7c-2.3 0-4.1-1.8-4.1-4.1V49.1c0-11.7 9.5-21.2 21.2-21.2"/>` +
			'<circle cx="160.3" cy="28" r="20.5"/>' +
			`<circle cx="160.3" cy="28" r="8.1" fill="${background}"/>`,
		label: { x: 160, y: 377, maxWidth: 270, fontSize: 38 },
	},
	ticket: {
		width: 300,
		height: 392,
		qrArea: { x: 14, y: 14, size: 272, radius: 10 },
		body: ticketBody,
		label: { x: 150, y: 332, maxWidth: 256, fontSize: 34 },
	},
};
