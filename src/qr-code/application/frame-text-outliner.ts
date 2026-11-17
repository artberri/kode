import type { OutlineFrameText } from "../domain/qr-frames";

/** The frame font, ready to draw text as outlines. */
export interface FrameTextOutlines {
	readonly outline: OutlineFrameText;
	/** The characters of a text the font can't draw, each once, in order. */
	readonly missing: (text: string) => readonly string[];
}

/** Loads the frame font, once, for drawing frame text as outlines. */
export interface FrameTextOutliner {
	load(): Promise<FrameTextOutlines>;
}
