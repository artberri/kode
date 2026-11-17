import { type ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/shared/ui/button";
import { Notice, type NoticeTone } from "@/shared/ui/notice";
import { SegmentedControl } from "@/shared/ui/segmented-control";
import { StepLabel } from "@/shared/ui/step-label";

import {
	type ExportFormat,
	type ExportQrCodeDependencies,
	type ExportQrCodeInput,
	type ExportQrCodeResult,
	exportQrCode,
} from "../../application/export-qr-code";
import type { ImageRasterizer } from "../../application/image-rasterizer";
import type { QrDesign } from "../../domain/qr-design";

const FORMATS = [
	{ value: "png", label: "PNG" },
	{ value: "svg", label: "SVG" },
	{ value: "webp", label: "WebP" },
] as const satisfies readonly { readonly value: ExportFormat; readonly label: string }[];

const FORMAT_NAMES: Record<ExportFormat, string> = { png: "PNG", svg: "SVG", webp: "WebP" };
const ALL_FORMATS: readonly ExportFormat[] = [];
const WEBP_OFF: readonly ExportFormat[] = ["webp"];
const NO_WEBP = "Nabigatzaile honek ezin du WebP sortu. Aukeratu PNG edo SVG.";

interface Outcome {
	readonly tone: NoticeTone;
	readonly text: string;
}

const FAILED: Outcome = {
	tone: "error",
	text: "Ezin izan dugu QRa deskargatu. Saiatu berriro.",
};

function outcomeOf(result: ExportQrCodeResult): Outcome {
	if (result.status === "saved") {
		return { tone: "success", text: `Deskargatuta: ${result.fileName}` };
	}
	if (result.status === "webp-unsupported") {
		return { tone: "warning", text: NO_WEBP };
	}
	// The button is disabled without a valid link, so only a race gets here.
	return { tone: "error", text: "Itsatsi esteka baliozko bat lehenago." };
}

/** Whether the browser can encode WebP; assumed until its canvas says otherwise. */
function useWebpSupport(rasterizer: ImageRasterizer): boolean {
	const [webp, setWebp] = useState(true);
	useEffect(() => {
		let current = true;
		const check = async (): Promise<void> => {
			const supported = await rasterizer.canEncode("webp").catch(() => false);
			if (current) {
				setWebp(supported);
			}
		};
		void check();
		return () => {
			current = false;
		};
	}, [rasterizer]);
	return webp;
}

/** Saves the file, and keeps what happened until the link, design or format changes. */
function useDownload(input: ExportQrCodeInput, dependencies: ExportQrCodeDependencies) {
	const [last, setLast] = useState<{ input: ExportQrCodeInput; outcome: Outcome }>();
	const download = useCallback(() => {
		const save = async (): Promise<void> => {
			const outcome = await exportQrCode(input, dependencies).then(outcomeOf, () => FAILED);
			setLast({ input, outcome });
		};
		void save();
	}, [input, dependencies]);
	return { download, outcome: last?.input === input ? last.outcome : undefined };
}

export interface DownloadStepProps {
	readonly link: string;
	readonly design: QrDesign;
	/** Whether the link is valid, so there is a code to save. */
	readonly ready: boolean;
	readonly preview: ReactNode;
	readonly dependencies: ExportQrCodeDependencies;
}

/** Step 3, "Deskarga": the preview, the format and the download button. */
export function DownloadStep({ link, design, ready, preview, dependencies }: DownloadStepProps) {
	const webp = useWebpSupport(dependencies.rasterizer);
	const [picked, setPicked] = useState<ExportFormat>("png");
	const format = picked === "webp" && !webp ? "png" : picked;
	const input = useMemo(() => ({ link, design, format }), [link, design, format]);
	const { download, outcome } = useDownload(input, dependencies);
	return (
		<fieldset
			aria-labelledby="urratsa-deskarga"
			className="m-0 flex min-w-0 flex-col gap-space-5 border-0 p-0"
		>
			<StepLabel step={3} id="urratsa-deskarga">
				Deskarga
			</StepLabel>
			{preview}
			<SegmentedControl
				name="formatua"
				legend="Formatua"
				items={FORMATS}
				value={format}
				onChange={setPicked}
				disabled={webp ? ALL_FORMATS : WEBP_OFF}
				hint={webp ? undefined : NO_WEBP}
				centred
			/>
			<Button size="lg" icon="download" block disabled={!ready} onClick={download}>
				{`Deskargatu ${FORMAT_NAMES[format]}`}
			</Button>
			{/* Always on the page, so screen readers announce the message when it arrives. */}
			{/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- <output> may only hold phrasing content, and Notice is a <p> */}
			<div role="status" className="empty:-mt-space-5">
				{outcome !== undefined && (
					<Notice tone={outcome.tone} live={false}>
						{outcome.text}
					</Notice>
				)}
			</div>
			<p className="m-0 text-center text-small text-ink-muted">
				Zure gailuan sortua. Ez dugu ezer gordetzen.
			</p>
		</fieldset>
	);
}
