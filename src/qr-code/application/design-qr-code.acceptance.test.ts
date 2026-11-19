import { describe, expect, it } from "vitest";

import type { QrContent } from "../domain/qr-content";
import { DEFAULT_DESIGN, type FrameStyle, type QrDesign } from "../domain/qr-design";
import { BoxFrameTextOutliner } from "../infrastructure/box-frame-text-outliner";
import { FixedMatrixEncoder } from "../infrastructure/fixed-matrix-encoder";
import { type DesignQrCodeResult, designQrCode } from "./design-qr-code";

const FRAMES: readonly FrameStyle[] = ["none", "label", "stamp", "clipboard", "ticket"];

function design(overrides: Partial<QrDesign> = {}): QrDesign {
	return { ...DEFAULT_DESIGN, ...overrides };
}

function linkContent(link: string): QrContent {
	return { type: "link", link };
}

function textContent(text: string): QrContent {
	return { type: "text", text };
}

function svgOf(result: DesignQrCodeResult): string {
	if (result.status !== "ready") {
		throw new Error(`Expected a ready QR code, got ${result.status}`);
	}
	return result.svg;
}

function numbersIn(svg: string, pattern: RegExp): number[] {
	return (pattern.exec(svg) ?? []).slice(1).map(Number);
}

describe("designQrCode", () => {
	it("waits for a link while the field is empty, without encoding anything", () => {
		const encoder = new FixedMatrixEncoder();
		expect(designQrCode({ content: linkContent("  "), design: design() }, { encoder })).toEqual(
			{
				status: "empty",
			},
		);
		expect(encoder.encoded).toEqual([]);
	});

	it.each([
		{ link: "ftp://kode.eus/", reason: "scheme" },
		{ link: "localhost:3000", reason: "host" },
		{ link: "kode.eus/nire menua", reason: "spaces" },
		{ link: `https://kode.eus/${"a".repeat(1000)}`, reason: "too-long" },
	])("rejects $link as $reason, without encoding anything", ({ link, reason }) => {
		const encoder = new FixedMatrixEncoder();
		expect(designQrCode({ content: linkContent(link), design: design() }, { encoder })).toEqual(
			{
				status: "invalid",
				problems: [{ field: "link", reason }],
			},
		);
		expect(encoder.encoded).toEqual([]);
	});

	it("encodes the normalised link and says whether https:// was added", () => {
		const encoder = new FixedMatrixEncoder();
		const result = designQrCode(
			{ content: linkContent(" kode.eus/menua "), design: design() },
			{ encoder },
		);
		expect(result).toMatchObject({
			status: "ready",
			encoded: {
				type: "link",
				payload: "https://kode.eus/menua",
				link: "https://kode.eus/menua",
				schemeAdded: true,
			},
		});
		expect(encoder.encoded).toEqual(["https://kode.eus/menua"]);
	});

	it("keeps a link that already has its scheme", () => {
		const result = designQrCode(
			{ content: linkContent("http://kode.eus/"), design: design() },
			{ encoder: new FixedMatrixEncoder() },
		);
		expect(result).toMatchObject({
			status: "ready",
			encoded: { link: "http://kode.eus/", schemeAdded: false },
		});
	});

	it("encodes a text exactly as typed, line breaks and accents included", () => {
		const encoder = new FixedMatrixEncoder();
		const text = " Kaixo!\nGoñi · Azpeitia — 19:00 ";
		const result = designQrCode({ content: textContent(text), design: design() }, { encoder });
		expect(result).toMatchObject({
			status: "ready",
			encoded: { type: "text", payload: text },
		});
		expect(encoder.encoded).toEqual([text]);
	});

	it("waits for a text that is only whitespace, without encoding anything", () => {
		const encoder = new FixedMatrixEncoder();
		expect(
			designQrCode({ content: textContent(" \n\t "), design: design() }, { encoder }),
		).toEqual({
			status: "empty",
		});
		expect(encoder.encoded).toEqual([]);
	});

	it("refuses a text over 1000 UTF-8 bytes, without encoding anything", () => {
		const encoder = new FixedMatrixEncoder();
		// 334 dashes of three bytes each: 1002 bytes in 334 characters.
		const text = "—".repeat(334);
		expect(designQrCode({ content: textContent(text), design: design() }, { encoder })).toEqual(
			{
				status: "invalid",
				problems: [{ field: "payload", reason: "too-long", excessBytes: 2 }],
			},
		);
		expect(encoder.encoded).toEqual([]);
	});

	it("draws the code as an SVG with the design's frame text and colours", () => {
		const colours = {
			qr: "#123456",
			background: "#FEFEFE",
			frame: "#654321",
			frameText: "#ABCDEF",
		} as const;
		const result = designQrCode(
			{
				content: linkContent("kode.eus"),
				design: design({ frame: "label", frameText: "Menua", colours }),
			},
			{ encoder: new FixedMatrixEncoder() },
		);
		const svg = svgOf(result);
		expect(svg).toMatch(/^<svg [^>]*>/u);
		expect(svg).toMatch(/<text[^>]*>Menua<\/text>/u);
		for (const colour of Object.values(colours)) {
			expect(svg).toContain(`"${colour}"`);
		}
	});

	it("draws the frame text as outlines when given them, as the saved files do", async () => {
		const { outline } = await new BoxFrameTextOutliner().load();
		const result = designQrCode(
			{
				content: linkContent("kode.eus"),
				design: design({ frame: "label", frameText: "Menua" }),
			},
			{ encoder: new FixedMatrixEncoder(), outlineFrameText: outline },
		);

		const svg = svgOf(result);
		expect(svg).toMatch(/<path class="qr-label" [^>]*d="M[^"]+"\/>/u);
		expect(svg).not.toContain("<text");
	});

	it.each([
		{ qr: "#2A1740", background: "#FFFFFF", contrast: "ok" },
		{ qr: "#CDB8FF", background: "#FFFFFF", contrast: "low" },
		{ qr: "#FFFFFF", background: "#2A1740", contrast: "inverted" },
	] as const)("rates $qr on $background as $contrast", ({ qr, background, contrast }) => {
		const colours = { ...DEFAULT_DESIGN.colours, qr, background };
		const result = designQrCode(
			{ content: linkContent("kode.eus"), design: design({ colours }) },
			{ encoder: new FixedMatrixEncoder() },
		);
		expect(result).toMatchObject({ status: "ready", contrast });
	});

	it.each(FRAMES)("leaves four modules of quiet zone inside the %s frame", (frame) => {
		const result = designQrCode(
			{ content: linkContent("kode.eus"), design: design({ frame }) },
			{ encoder: new FixedMatrixEncoder() },
		);
		const svg = svgOf(result);
		const [areaX = 0, areaY = 0, areaSize = 0] = numbersIn(
			svg,
			/<rect class="qr-area" x="([\d.]+)" y="([\d.]+)" width="([\d.]+)"/u,
		);
		const [x = 0, y = 0, unit = 0] = numbersIn(
			svg,
			/translate\(([\d.]+) ([\d.]+)\) scale\(([\d.]+)\)/u,
		);
		const modules = 21;
		const quiet = 4 * unit - 1e-3;
		expect(unit).toBeGreaterThan(0);
		expect(x - areaX).toBeGreaterThanOrEqual(quiet);
		expect(y - areaY).toBeGreaterThanOrEqual(quiet);
		expect(areaX + areaSize - (x + modules * unit)).toBeGreaterThanOrEqual(quiet);
		expect(areaY + areaSize - (y + modules * unit)).toBeGreaterThanOrEqual(quiet);
	});
});
