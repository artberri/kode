import { useEffect, useMemo, useState } from "react";

import { type DesignQrCodeResult, designQrCode } from "../../application/design-qr-code";
import type { FrameTextOutliner, FrameTextOutlines } from "../../application/frame-text-outliner";
import type { QrMatrixEncoder } from "../../application/qr-matrix-encoder";
import { DEFAULT_DESIGN, type QrDesign } from "../../domain/qr-design";
import type { OutlineFrameText } from "../../domain/qr-frames";

/** What the preview shows, dimmed, until the link is valid. */
const PLACEHOLDER_LINK = "https://kode.eus/";

const NONE: readonly string[] = [];

/**
 * The frame font as outlines, loaded once someone starts using the generator, so a visit that
 * only reads the page doesn't download it. `undefined` until then, or if it fails to load.
 */
function useFrameTextOutlines(
	outliner: FrameTextOutliner,
	wanted: boolean,
): FrameTextOutlines | undefined {
	const [outlines, setOutlines] = useState<FrameTextOutlines>();
	useEffect(() => {
		let current = true;
		const load = async (): Promise<void> => {
			try {
				const loaded = await outliner.load();
				if (current) {
					setOutlines(loaded);
				}
			} catch {
				// The preview keeps its <text> label, and a download tries the font again.
			}
		};
		if (wanted && outlines === undefined) {
			void load();
		}
		return () => {
			current = false;
		};
	}, [outliner, wanted, outlines]);
	return outlines;
}

/** The code to show: the link's, or the placeholder's in the same design until the link is valid. */
function previewSvg(
	result: DesignQrCodeResult,
	design: QrDesign,
	encoder: QrMatrixEncoder,
	outlineFrameText: OutlineFrameText | undefined,
): string {
	if (result.status === "ready") {
		return result.svg;
	}
	const placeholder = designQrCode(
		{ link: PLACEHOLDER_LINK, design },
		{ encoder, outlineFrameText },
	);
	return placeholder.status === "ready" ? placeholder.svg : "";
}

export interface Preview {
	readonly result: DesignQrCodeResult;
	readonly svg: string;
	/** The characters of the frame text the preview and the files leave out. */
	readonly undrawable: readonly string[];
}

/**
 * The code for the link and design as it will be saved: once the frame font has loaded, the
 * frame text is drawn with the same outlines as the files.
 */
export function usePreview(
	{ link, design }: { readonly link: string; readonly design: QrDesign },
	{
		encoder,
		outliner,
	}: { readonly encoder: QrMatrixEncoder; readonly outliner: FrameTextOutliner },
): Preview {
	const outlines = useFrameTextOutlines(outliner, link !== "" || design !== DEFAULT_DESIGN);
	const outlineFrameText = outlines?.outline;
	const result = useMemo(
		() => designQrCode({ link, design }, { encoder, outlineFrameText }),
		[link, design, encoder, outlineFrameText],
	);
	const svg = useMemo(
		() => previewSvg(result, design, encoder, outlineFrameText),
		[result, design, encoder, outlineFrameText],
	);
	const undrawable = useMemo(
		() =>
			outlines === undefined || design.frame === "none"
				? NONE
				: outlines.missing(design.frameText),
		[outlines, design.frame, design.frameText],
	);
	return { result, svg, undrawable };
}

/** The code as an image named by its link, dimmed until the link is valid. */
export function QrPreview({ result, svg }: Pick<Preview, "result" | "svg">) {
	const ready = result.status === "ready";
	const label = ready
		? `QR kodearen aurrebista: ${result.link}`
		: "QR kodearen aurrebista, esteka baliozko baten zain";
	const markup = useMemo(() => ({ __html: svg }), [svg]);
	return (
		<div
			// Inline SVG rather than an <img>, so the frame text uses the page's Unbounded font until
			// the outlines have loaded.
			// oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- an <img> can't use the page's fonts
			role="img"
			aria-label={label}
			className={`w-[250px] max-w-full self-center [&>svg]:block [&>svg]:h-auto [&>svg]:w-full ${ready ? "" : "opacity-20"}`}
			dangerouslySetInnerHTML={markup}
		/>
	);
}
