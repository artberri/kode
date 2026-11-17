import type { FrameTextOutliner, FrameTextOutlines } from "../application/frame-text-outliner";
import type { LabelSlot } from "../domain/qr-frames";
import { num } from "../domain/svg-path";

/** Every character is this many em wide, and its box this many em tall. */
const ADVANCE = 0.6;
const BOX_HEIGHT = 0.7;
const EXTRA_CHARACTERS = new Set(["€", "‘", "’", "“", "”", "–", "—", "…"]);

/** Like the frame font's Latin subset: Latin letters and a little punctuation. */
function canDraw(character: string): boolean {
	return (character.codePointAt(0) ?? 0) <= 0x2ff || EXTRA_CHARACTERS.has(character);
}

function outline(text: string, slot: LabelSlot): string {
	const characters = Array.from(text).filter((character) => canDraw(character));
	if (characters.join("").trim() === "") {
		return "";
	}
	const fontSize = Math.min(slot.fontSize, slot.maxWidth / (characters.length * ADVANCE));
	const advance = fontSize * ADVANCE;
	const height = fontSize * BOX_HEIGHT;
	const left = slot.x - (characters.length * advance) / 2;
	const top = slot.y - height / 2;
	return characters
		.map((character, index) =>
			character.trim() === ""
				? ""
				: `M${num(left + index * advance)} ${num(top)}h${num(advance)}v${num(height)}h${num(-advance)}Z`,
		)
		.join("");
}

const OUTLINES: FrameTextOutlines = {
	outline,
	missing: (text) => [...new Set(Array.from(text).filter((character) => !canDraw(character)))],
};

/** An outliner that draws one box per character, so fitting and centring are easy to check. */
export class BoxFrameTextOutliner implements FrameTextOutliner {
	async load(): Promise<FrameTextOutlines> {
		return await Promise.resolve(OUTLINES);
	}
}
