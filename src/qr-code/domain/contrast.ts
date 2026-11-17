import { type HexColor, relativeLuminance } from "./colour";

/** Below this ratio between the QR and its background, some phone cameras fail to read the code. */
export const MIN_CONTRAST_RATIO = 3;

export type Contrast = "ok" | "low" | "inverted";

/**
 * How readable a QR colour is on a background: `low` below 3:1, `inverted` when the QR is the
 * lighter of the two, which many cameras read badly. Low contrast wins when both apply.
 */
export function contrastOf(qr: HexColor, background: HexColor): Contrast {
	const qrLuminance = relativeLuminance(qr);
	const backgroundLuminance = relativeLuminance(background);
	const lighter = Math.max(qrLuminance, backgroundLuminance);
	const darker = Math.min(qrLuminance, backgroundLuminance);
	if ((lighter + 0.05) / (darker + 0.05) < MIN_CONTRAST_RATIO) {
		return "low";
	}
	return qrLuminance > backgroundLuminance ? "inverted" : "ok";
}
