/** Renders the generator on in-memory fakes, and finds its parts as people would. */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { FrameTextOutliner } from "../../application/frame-text-outliner";
import type { RasterizeOptions } from "../../application/image-rasterizer";
import { FakeImageRasterizer } from "../fake-image-rasterizer";
import { InMemoryFileSaver } from "../in-memory-file-saver";
import { QrGenerator } from "./qr-generator";

export const FIELD = "Nora eraman behar du zure QRak?";
export const FRAME_TEXT = "Markoaren testua";
const PREVIEW = /^QR kodearen aurrebista/u;

/** The frame font still on its way: the preview keeps its `<text>` label. */
const LOADING_OUTLINER: FrameTextOutliner = {
	load: async () =>
		await new Promise(() => {
			// The font never arrives.
		}),
};

/** A canvas that fails, as one out of memory would. */
export class BrokenRasterizer extends FakeImageRasterizer {
	override async rasterize(svg: string, options: RasterizeOptions): Promise<Blob> {
		await super.rasterize(svg, options);
		throw new Error("The canvas is out of memory");
	}
}

interface SetupOptions {
	readonly webp?: boolean;
	readonly outliner?: FrameTextOutliner;
	readonly rasterizer?: FakeImageRasterizer;
}

export function setup({ webp = true, outliner = LOADING_OUTLINER, rasterizer }: SetupOptions = {}) {
	const user = userEvent.setup();
	const saver = new InMemoryFileSaver();
	render(
		<QrGenerator
			rasterizer={rasterizer ?? new FakeImageRasterizer({ webp })}
			saver={saver}
			outliner={outliner}
		/>,
	);
	return { user, saver };
}

export function downloadButton(): HTMLElement {
	return screen.getByRole("button", { name: /^Deskargatu/u });
}

export async function typeLink(user: ReturnType<typeof userEvent.setup>, link = "kode.eus") {
	await user.type(screen.getByRole("textbox", { name: FIELD }), link);
}

export function preview(): HTMLElement {
	return screen.getByRole("img", { name: PREVIEW });
}
