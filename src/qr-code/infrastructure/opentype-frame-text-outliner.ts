import type { Font } from "opentype.js/dist/opentype.mjs";

import type { FrameTextOutliner, FrameTextOutlines } from "../application/frame-text-outliner";
import type { LabelSlot } from "../domain/qr-frames";

/** Where the site serves the frame font: Unbounded 800, Latin subset, under the SIL OFL. */
export const FRAME_FONT_URL = "/fonts/unbounded-800-latin.ttf";

/** Two decimals of a frame unit is far below a pixel, even at 1024 px. */
const DECIMAL_PLACES = 2;

/** Fetches the frame font from the site. */
export async function fetchFrameFont(): Promise<ArrayBuffer> {
	const response = await fetch(FRAME_FONT_URL);
	if (!response.ok) {
		throw new Error(`Could not load the frame font: ${String(response.status)}`);
	}
	return await response.arrayBuffer();
}

function outlinesOf(font: Font): FrameTextOutlines {
	const canDraw = (character: string): boolean => font.charToGlyphIndex(character) !== 0;
	const drawable = (text: string): string =>
		Array.from(text)
			.filter((character) => canDraw(character))
			.join("");
	return {
		outline: (text: string, slot: LabelSlot): string => {
			const kept = drawable(text);
			if (kept.trim() === "") {
				return "";
			}
			const fontSize = Math.min(slot.fontSize, slot.maxWidth / font.getAdvanceWidth(kept, 1));
			const width = font.getAdvanceWidth(kept, fontSize);
			// Like `dominant-baseline: central`: the middle of the em box sits on the slot's `y`.
			const baseline =
				slot.y + ((font.ascender + font.descender) / 2 / font.unitsPerEm) * fontSize;
			return (
				font
					.getPath(kept, slot.x - width / 2, baseline, fontSize)
					// getPath already uses SVG's downward y; the default flip would turn the text upside down.
					.toPathData({ decimalPlaces: DECIMAL_PLACES, flipY: false })
			);
		},
		missing: (text: string): readonly string[] => [
			...new Set(Array.from(text).filter((character) => !canDraw(character))),
		],
	};
}

/**
 * Draws frame text as Unbounded outlines with opentype.js. The library and the font load on the
 * first `load()` only, so the page doesn't pay for them until someone exports.
 */
export class OpentypeFrameTextOutliner implements FrameTextOutliner {
	readonly #fontBytes: () => Promise<ArrayBuffer>;
	#loaded: Promise<FrameTextOutlines> | undefined;

	constructor(fontBytes: () => Promise<ArrayBuffer> = fetchFrameFont) {
		this.#fontBytes = fontBytes;
	}

	async load(): Promise<FrameTextOutlines> {
		this.#loaded ??= Promise.all([
			import("opentype.js/dist/opentype.mjs"),
			this.#fontBytes(),
		]).then(
			([{ parse }, bytes]) => outlinesOf(parse(bytes)),
			(error: unknown) => {
				// Forget the failure, so the next export tries again rather than failing for good.
				this.#loaded = undefined;
				throw error;
			},
		);
		return await this.#loaded;
	}
}
