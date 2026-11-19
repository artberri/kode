import { type Contrast, contrastOf } from "../domain/contrast";
import { encodeContent } from "../domain/encode-content";
import type { ContentProblem, EncodedContent, QrContent } from "../domain/qr-content";
import type { QrDesign } from "../domain/qr-design";
import type { OutlineFrameText } from "../domain/qr-frames";
import { renderQrSvg } from "../domain/render-qr-svg";
import type { QrMatrixEncoder } from "./qr-matrix-encoder";

export interface DesignQrCodeInput {
	/** What people filled in, as they typed it. */
	readonly content: QrContent;
	readonly design: QrDesign;
}

export interface DesignQrCodeDependencies {
	readonly encoder: QrMatrixEncoder;
	/** Draws the frame text as outlines, once the frame font has loaded, as the saved files do. */
	readonly outlineFrameText?: OutlineFrameText | undefined;
}

export type DesignQrCodeResult =
	| { readonly status: "empty" }
	| { readonly status: "invalid"; readonly problems: readonly ContentProblem[] }
	| {
			readonly status: "ready";
			/** The text the code holds, with what the UI needs to describe it. */
			readonly encoded: EncodedContent;
			readonly svg: string;
			readonly contrast: Contrast;
	  };

/** Turns typed content and a design into the QR code to preview, or says why it can't. */
export function designQrCode(
	{ content, design }: DesignQrCodeInput,
	{ encoder, outlineFrameText }: DesignQrCodeDependencies,
): DesignQrCodeResult {
	const encoding = encodeContent(content);
	if (encoding.status !== "valid") {
		return encoding;
	}
	const { encoded } = encoding;
	return {
		status: "ready",
		encoded,
		svg: renderQrSvg(encoder.encode(encoded.payload), design, { outlineFrameText }),
		contrast: contrastOf(design.colours.qr, design.colours.background),
	};
}
