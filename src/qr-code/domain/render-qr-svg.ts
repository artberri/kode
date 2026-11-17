import { MAX_FRAME_TEXT_LENGTH, type QrDesign } from "./qr-design";
import { FRAME_LAYOUTS, type LabelSlot } from "./qr-frames";
import type { QrMatrix } from "./qr-matrix";
import { dotsPath, finderPath } from "./qr-shapes";
import { num } from "./svg-path";

/** Light modules the QR standard asks for on every side of the code. */
export const QUIET_ZONE_MODULES = 4;

/** Unbounded is wide: its average glyph at weight 800 is about three quarters of the font size. */
const AVERAGE_GLYPH_WIDTH = 0.75;
const FRAME_FONT_FAMILY = "Unbounded, &apos;Arial Black&apos;, sans-serif";

const XML_ESCAPES: Record<string, string> = {
	"&": "&amp;",
	"<": "&lt;",
	">": "&gt;",
	'"': "&quot;",
	"'": "&apos;",
};

function escapeXml(text: string): string {
	return text.replaceAll(/[&<>"']/gu, (character) => XML_ESCAPES[character] ?? character);
}

function frameLabel(text: string, slot: LabelSlot, colour: string): string {
	const cut = Array.from(text).slice(0, MAX_FRAME_TEXT_LENGTH).join("");
	if (cut.trim() === "") {
		return "";
	}
	const fitted = slot.maxWidth / (Array.from(cut).length * AVERAGE_GLYPH_WIDTH);
	const fontSize = Math.min(slot.fontSize, Math.floor(fitted));
	return (
		`<text x="${num(slot.x)}" y="${num(slot.y)}" fill="${colour}" font-family="${FRAME_FONT_FAMILY}" ` +
		`font-weight="800" font-size="${String(fontSize)}" text-anchor="middle" dominant-baseline="central">` +
		`${escapeXml(cut)}</text>`
	);
}

/**
 * Draws a QR code in a design as a standalone SVG document. The code sits in its frame's QR area
 * with at least four modules of quiet zone on every side, so it scans however it is framed.
 */
export function renderQrSvg(matrix: QrMatrix, design: QrDesign): string {
	const layout = FRAME_LAYOUTS[design.frame];
	const { colours } = design;
	const { qrArea } = layout;
	const size = matrix.length;

	// Rounded down so the code never outgrows its quiet zone.
	const unit = Math.floor((qrArea.size / (size + QUIET_ZONE_MODULES * 2)) * 10_000) / 10_000;
	const margin = (qrArea.size - size * unit) / 2;
	const radius = Math.min(qrArea.radius, QUIET_ZONE_MODULES * unit);

	const frame =
		layout.body === undefined
			? ""
			: `<g class="qr-frame" fill="${colours.frame}">${layout.body(colours)}</g>`;
	const area =
		`<rect class="qr-area" x="${num(qrArea.x)}" y="${num(qrArea.y)}" width="${num(qrArea.size)}" ` +
		`height="${num(qrArea.size)}" rx="${num(radius)}" fill="${colours.background}"/>`;
	const modules =
		`<g class="qr-modules" transform="translate(${num(qrArea.x + margin)} ${num(qrArea.y + margin)}) scale(${String(unit)})" fill="${colours.qr}">` +
		`<path class="qr-dots" d="${dotsPath(matrix, design.dots)}"/>` +
		`<path class="qr-finders" d="${finderPath(size, design.corner, design.centre)}"/>` +
		"</g>";
	const label =
		layout.label === undefined
			? ""
			: frameLabel(design.frameText, layout.label, colours.frameText);

	const width = String(layout.width);
	const height = String(layout.height);
	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">` +
		`${frame}${area}${modules}${label}</svg>`
	);
}
