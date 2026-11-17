export type RasterFormat = "png" | "webp";

export interface RasterizeOptions {
	readonly format: RasterFormat;
	/** The image's longer side, in pixels; the shorter one keeps the SVG's proportions. */
	readonly longSide: number;
}

/** Turns an SVG document into a bitmap image. */
export interface ImageRasterizer {
	rasterize(svg: string, options: RasterizeOptions): Promise<Blob>;
	/** Whether this browser really encodes the format, rather than falling back to another. */
	canEncode(format: RasterFormat): Promise<boolean>;
}
