import { useEffect, useMemo, useState } from "react";

import { type DesignQrCodeResult, designQrCode } from "../../application/design-qr-code";
import type { FrameTextOutliner, FrameTextOutlines } from "../../application/frame-text-outliner";
import type { QrMatrixEncoder } from "../../application/qr-matrix-encoder";
import { encodeContent } from "../../domain/encode-content";
import type { QrContent } from "../../domain/qr-content";
import { DEFAULT_DESIGN, type QrDesign } from "../../domain/qr-design";
import type { OutlineFrameText } from "../../domain/qr-frames";
import { contentTypeUi, type OfferedType, previewNameOf } from "./content-types";
import { ScanSummary } from "./scan-summary";

/** What the preview shows until the content is valid. */
const PLACEHOLDER_LINK = "https://kode.eus/";
const PLACEHOLDER: QrContent = { type: "link", link: PLACEHOLDER_LINK };

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

/** The code to show: the content's, or the placeholder's in the same design until it is valid. */
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
		{ content: PLACEHOLDER, design },
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
 * The code for the content and design as it will be saved: once the frame font has loaded, the
 * frame text is drawn with the same outlines as the files.
 */
export function usePreview(
	{ content, design }: { readonly content: QrContent; readonly design: QrDesign },
	{
		encoder,
		outliner,
	}: { readonly encoder: QrMatrixEncoder; readonly outliner: FrameTextOutliner },
): Preview {
	const started = useMemo(() => encodeContent(content).status !== "empty", [content]);
	const outlines = useFrameTextOutlines(outliner, started || design !== DEFAULT_DESIGN);
	const outlineFrameText = outlines?.outline;
	const result = useMemo(
		() => designQrCode({ content, design }, { encoder, outlineFrameText }),
		[content, design, encoder, outlineFrameText],
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

/** How the preview names itself, and whether it is dimmed. */
function previewState(
	type: OfferedType,
	result: DesignQrCodeResult,
): { label: string; dimmed: boolean } {
	if (result.status === "ready") {
		return { label: `QR kodearen aurrebista: ${previewNameOf(result.encoded)}`, dimmed: false };
	}
	// Nothing typed yet: the placeholder is a sample of the design, not a waiting state.
	if (result.status === "empty") {
		return { label: `QR kodearen aurrebista (adibidea): ${PLACEHOLDER_LINK}`, dimmed: false };
	}
	// Dimmed, so content that doesn't work never looks like a finished code.
	return { label: contentTypeUi(type).waitingLabel, dimmed: true };
}

/**
 * The code as an image named by its content, then what scanning it does and how dense it is. While
 * nothing is filled in it shows the kode.eus sample in the same design; while the content is
 * invalid, that sample dimmed, and neither the scan line nor the density.
 */
export function QrPreview({
	type,
	result,
	svg,
}: Pick<Preview, "result" | "svg"> & { readonly type: OfferedType }) {
	const { label, dimmed } = previewState(type, result);
	const markup = useMemo(() => ({ __html: svg }), [svg]);
	return (
		<>
			<div
				// Inline SVG rather than an <img>, so the frame text uses the page's Unbounded font until
				// the outlines have loaded.
				// oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- an <img> can't use the page's fonts
				role="img"
				aria-label={label}
				className={`w-[250px] max-w-full self-center [&>svg]:block [&>svg]:h-auto [&>svg]:w-full ${dimmed ? "opacity-20" : ""}`}
				dangerouslySetInnerHTML={markup}
			/>
			<ScanSummary result={result} />
		</>
	);
}
