import { type Contrast, contrastOf } from "../domain/contrast";
import { type InvalidLinkReason, parseLink } from "../domain/parse-link";
import type { QrDesign } from "../domain/qr-design";
import { renderQrSvg } from "../domain/render-qr-svg";
import type { QrMatrixEncoder } from "./qr-matrix-encoder";

export interface DesignQrCodeInput {
	/** The link as people typed it. */
	readonly link: string;
	readonly design: QrDesign;
}

export interface DesignQrCodeDependencies {
	readonly encoder: QrMatrixEncoder;
}

export type DesignQrCodeResult =
	| { readonly status: "empty" }
	| { readonly status: "invalid"; readonly reason: InvalidLinkReason }
	| {
			readonly status: "ready";
			/** The normalised link the code holds. */
			readonly link: string;
			readonly schemeAdded: boolean;
			readonly svg: string;
			readonly contrast: Contrast;
	  };

/** Turns a typed link and a design into the QR code to preview, or says why it can't. */
export function designQrCode(
	{ link, design }: DesignQrCodeInput,
	{ encoder }: DesignQrCodeDependencies,
): DesignQrCodeResult {
	const parsed = parseLink(link);
	if (parsed.status !== "valid") {
		return parsed;
	}
	return {
		status: "ready",
		link: parsed.link,
		schemeAdded: parsed.schemeAdded,
		svg: renderQrSvg(encoder.encode(parsed.link), design),
		contrast: contrastOf(design.colours.qr, design.colours.background),
	};
}
