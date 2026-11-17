import { parseLink } from "../domain/parse-link";
import type { QrDesign } from "../domain/qr-design";
import { renderQrSvg } from "../domain/render-qr-svg";
import type { FileSaver } from "./file-saver";
import type { FrameTextOutliner } from "./frame-text-outliner";
import type { ImageRasterizer } from "./image-rasterizer";
import type { QrMatrixEncoder } from "./qr-matrix-encoder";

export type ExportFormat = "png" | "svg" | "webp";

/** PNG and WebP files are this many pixels on their long side. */
export const EXPORT_LONG_SIDE = 1024;

export interface ExportQrCodeInput {
	/** The link as people typed it. */
	readonly link: string;
	readonly design: QrDesign;
	readonly format: ExportFormat;
}

export interface ExportQrCodeDependencies {
	readonly encoder: QrMatrixEncoder;
	readonly rasterizer: ImageRasterizer;
	readonly saver: FileSaver;
	readonly outliner: FrameTextOutliner;
}

export type ExportQrCodeResult =
	| { readonly status: "saved"; readonly fileName: string }
	| { readonly status: "no-link" }
	| { readonly status: "webp-unsupported" };

/**
 * Saves the QR code as a file in the chosen format, with its frame text drawn as outlines so it
 * looks the same in any viewer. Nothing leaves the browser.
 */
export async function exportQrCode(
	{ link, design, format }: ExportQrCodeInput,
	{ encoder, rasterizer, saver, outliner }: ExportQrCodeDependencies,
): Promise<ExportQrCodeResult> {
	const parsed = parseLink(link);
	if (parsed.status !== "valid") {
		return { status: "no-link" };
	}
	if (format === "webp" && !(await rasterizer.canEncode("webp"))) {
		return { status: "webp-unsupported" };
	}
	const { outline } = await outliner.load();
	const matrix = encoder.encode(parsed.link);
	// The SVG file has no fixed size, so viewers scale it to fit; a canvas needs one to draw it.
	const svg = renderQrSvg(matrix, design, { outlineFrameText: outline, sized: format !== "svg" });
	const blob =
		format === "svg"
			? new Blob([svg], { type: "image/svg+xml" })
			: await rasterizer.rasterize(svg, { format, longSide: EXPORT_LONG_SIDE });
	const fileName = `kode-qr.${format}`;
	saver.save({ name: fileName, blob });
	return { status: "saved", fileName };
}
