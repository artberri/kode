import type {
	ImageRasterizer,
	RasterFormat,
	RasterizeOptions,
} from "../application/image-rasterizer";

export interface RasterizeCall extends RasterizeOptions {
	readonly svg: string;
}

/** A rasterizer that remembers what it drew and returns a tiny blob of the asked-for type. */
export class FakeImageRasterizer implements ImageRasterizer {
	readonly calls: RasterizeCall[] = [];
	readonly #webp: boolean;

	constructor({ webp = true }: { readonly webp?: boolean } = {}) {
		this.#webp = webp;
	}

	async rasterize(svg: string, options: RasterizeOptions): Promise<Blob> {
		this.calls.push({ svg, ...options });
		return await Promise.resolve(new Blob(["fake"], { type: `image/${options.format}` }));
	}

	async canEncode(format: RasterFormat): Promise<boolean> {
		return await Promise.resolve(format !== "webp" || this.#webp);
	}
}
