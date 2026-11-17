import type {
	ImageRasterizer,
	RasterFormat,
	RasterizeOptions,
} from "../application/image-rasterizer";

/** At 1, Chrome encodes WebP losslessly; below it, edges of the flat colours blur. PNG ignores it. */
const QUALITY = 1;

async function toBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
	return await new Promise((resolve) => {
		canvas.toBlob(resolve, type, QUALITY);
	});
}

function mimeType(format: RasterFormat): string {
	return `image/${format}`;
}

/**
 * Draws an SVG onto a canvas through an `<img>` and encodes the canvas. The SVG must need nothing
 * from outside itself (no fonts, no links): the frame text arrives already outlined.
 */
export class CanvasImageRasterizer implements ImageRasterizer {
	readonly #support = new Map<RasterFormat, Promise<boolean>>();

	async rasterize(svg: string, { format, longSide }: RasterizeOptions): Promise<Blob> {
		const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
		try {
			const image = new Image();
			image.src = url;
			await image.decode();
			const scale = longSide / Math.max(image.naturalWidth, image.naturalHeight);
			const canvas = document.createElement("canvas");
			canvas.width = Math.round(image.naturalWidth * scale);
			canvas.height = Math.round(image.naturalHeight * scale);
			const context = canvas.getContext("2d");
			if (context === null) {
				throw new Error("This browser has no 2D canvas");
			}
			context.drawImage(image, 0, 0, canvas.width, canvas.height);
			const blob = await toBlob(canvas, mimeType(format));
			// Browsers that can't encode a format fall back to PNG without saying so.
			if (blob?.type !== mimeType(format)) {
				throw new Error(`This browser can't encode ${format}`);
			}
			return blob;
		} finally {
			URL.revokeObjectURL(url);
		}
	}

	/** Asks the canvas for a tiny image in the format and checks what it really returned. */
	async canEncode(format: RasterFormat): Promise<boolean> {
		let support = this.#support.get(format);
		if (support === undefined) {
			const canvas = document.createElement("canvas");
			canvas.width = 1;
			canvas.height = 1;
			support = toBlob(canvas, mimeType(format)).then(
				(blob) => blob?.type === mimeType(format),
			);
			this.#support.set(format, support);
		}
		return await support;
	}
}
