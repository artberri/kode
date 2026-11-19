import { describe, expect, it } from "vitest";

import type { QrContent } from "../domain/qr-content";
import { DEFAULT_DESIGN, type QrDesign } from "../domain/qr-design";
import { BoxFrameTextOutliner } from "../infrastructure/box-frame-text-outliner";
import { FakeImageRasterizer } from "../infrastructure/fake-image-rasterizer";
import { FixedMatrixEncoder } from "../infrastructure/fixed-matrix-encoder";
import { InMemoryFileSaver } from "../infrastructure/in-memory-file-saver";
import { exportQrCode, type ExportFormat } from "./export-qr-code";

const CONTENT: QrContent = { type: "esteka", link: "kode.eus/menua" };

/** The text of the one file the saver holds. */
async function savedText(saver: InMemoryFileSaver): Promise<string> {
	const [file] = saver.saved;
	if (saver.saved.length !== 1 || file === undefined) {
		throw new Error(`Expected one saved file, got ${String(saver.saved.length)}`);
	}
	return await file.blob.text();
}

function setup({ webp = true }: { readonly webp?: boolean } = {}) {
	const rasterizer = new FakeImageRasterizer({ webp });
	const saver = new InMemoryFileSaver();
	const dependencies = {
		encoder: new FixedMatrixEncoder(),
		rasterizer,
		saver,
		outliner: new BoxFrameTextOutliner(),
	};
	const exportAs = async (format: ExportFormat, design: QrDesign = DEFAULT_DESIGN) =>
		await exportQrCode({ content: CONTENT, design, format }, dependencies);
	return { rasterizer, saver, dependencies, exportAs };
}

describe("exportQrCode", () => {
	it("saves the SVG as kode-esteka.svg, with the frame text as outlines", async () => {
		const { saver, rasterizer, exportAs } = setup();

		expect(await exportAs("svg")).toEqual({ status: "saved", fileName: "kode-esteka.svg" });

		expect(saver.saved.map((file) => [file.name, file.blob.type])).toEqual([
			["kode-esteka.svg", "image/svg+xml"],
		]);
		const svg = await savedText(saver);
		expect(svg).toMatch(/^<svg [^>]*>/u);
		expect(svg).toMatch(/<path class="qr-label" fill="#FFFFFF" d="M[^"]+"\/>/u);
		expect(svg).not.toContain("<text");
		expect(svg).not.toMatch(/url\(|href=/u);
		expect(rasterizer.calls).toEqual([]);
	});

	it("leaves the SVG's size to its viewBox, so viewers scale it to fit", async () => {
		const { saver, exportAs } = setup();

		await exportAs("svg");

		const root = /^<svg [^>]*>/u.exec(await savedText(saver))?.[0];
		expect(root).toMatch(/ viewBox="0 0 [\d.]+ [\d.]+"/u);
		expect(root).not.toMatch(/ (?:width|height)=/u);
	});

	it.each(["png", "webp"] as const)(
		"draws the same outlined SVG at 1024 px and saves kode-esteka.%s",
		async (format) => {
			const { saver, rasterizer, exportAs } = setup();
			const svgFile = setup();
			await svgFile.exportAs("svg");
			const svg = await savedText(svgFile.saver);

			expect(await exportAs(format)).toEqual({
				status: "saved",
				fileName: `kode-esteka.${format}`,
			});

			// The same drawing, sized: Firefox can't draw an SVG without a size onto a canvas.
			expect(rasterizer.calls.map((call) => call.svg)).toEqual([
				expect.stringMatching(/^<svg [^>]* width="[\d.]+" height="[\d.]+">/u),
			]);
			expect(
				rasterizer.calls.map(({ svg: drawn, ...options }) => [
					drawn.replace(/ width="[\d.]+" height="[\d.]+">/u, ">"),
					options,
				]),
			).toEqual([[svg, { format, longSide: 1024 }]]);
			expect(saver.saved.map((file) => [file.name, file.blob.type])).toEqual([
				[`kode-esteka.${format}`, `image/${format}`],
			]);
		},
	);

	it("saves no WebP where the browser can't encode it", async () => {
		const { saver, rasterizer, exportAs } = setup({ webp: false });

		expect(await exportAs("webp")).toEqual({ status: "webp-unsupported" });

		expect(saver.saved).toEqual([]);
		expect(rasterizer.calls).toEqual([]);
	});

	it.each(["", "ftp://kode.eus/"])("saves nothing for the link %j", async (link) => {
		const { saver, dependencies } = setup();

		expect(
			await exportQrCode(
				{ content: { type: "esteka", link }, design: DEFAULT_DESIGN, format: "png" },
				dependencies,
			),
		).toEqual({ status: "invalid-content" });

		expect(saver.saved).toEqual([]);
	});

	it("draws no label without a frame", async () => {
		const { saver, exportAs } = setup();

		await exportAs("svg", { ...DEFAULT_DESIGN, frame: "none" });

		expect(await savedText(saver)).not.toContain("qr-label");
	});
});
