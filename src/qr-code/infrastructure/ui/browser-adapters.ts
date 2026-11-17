import type { ExportQrCodeDependencies } from "../../application/export-qr-code";
import { BrowserFileSaver } from "../browser-file-saver";
import { CanvasImageRasterizer } from "../canvas-image-rasterizer";
import { OpentypeFrameTextOutliner } from "../opentype-frame-text-outliner";
import { QrcodeGeneratorEncoder } from "../qrcode-generator-encoder";

/**
 * The adapters the generator runs on in the browser. None touches the page until it's used, so
 * building them during server rendering is safe.
 */
export const BROWSER_ADAPTERS: ExportQrCodeDependencies = {
	encoder: new QrcodeGeneratorEncoder(),
	rasterizer: new CanvasImageRasterizer(),
	saver: new BrowserFileSaver(),
	outliner: new OpentypeFrameTextOutliner(),
};
