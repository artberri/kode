"use client";

import { useCallback, useMemo, useState } from "react";

import { StepLabel } from "@/shared/ui/step-label";
import { TabPanel, Tabs } from "@/shared/ui/tabs";
import { TicketCard } from "@/shared/ui/ticket-card";
import { UrlField } from "@/shared/ui/url-field";

import { type DesignQrCodeResult, designQrCode } from "../../application/design-qr-code";
import type { InvalidLinkReason } from "../../domain/parse-link";
import { DEFAULT_DESIGN, type QrDesign } from "../../domain/qr-design";
import { QrcodeGeneratorEncoder } from "../qrcode-generator-encoder";
import { type DesignChange, FramePanel, ShapePanel } from "./design-panels";

const encoder = new QrcodeGeneratorEncoder();

/** What the preview shows, dimmed, until the link is valid. */
const PLACEHOLDER_LINK = "https://kode.eus/";

const ERRORS: Record<InvalidLinkReason, string> = {
	scheme: "Estekak http:// edo https:// izan behar du. Adibidez: kode.eus",
	host: "Helbide hori ez da baliozkoa. Adibidez: kode.eus",
	spaces: "Estekak ezin du hutsunerik izan. Adibidez: kode.eus/nire-menua",
	"too-long": "Esteka luzeegia da: gehienez 1000 karaktere.",
};

type FieldMessages =
	| { readonly hint: string }
	| { readonly success: string }
	| { readonly error: string };

function fieldMessages(result: DesignQrCodeResult, left: boolean): FieldMessages {
	if (result.status === "empty") {
		return { hint: "Itsatsi esteka bat zure QRa sortzeko." };
	}
	if (result.status === "ready") {
		return result.schemeAdded
			? { success: `https:// gehitu diogu hasieran: ${result.link}` }
			: { success: `Zure QRak esteka hau irekiko du: ${result.link}` };
	}
	// "kode" is a host without a dot until ".eus" is typed: only call it wrong once the field is left.
	return result.reason === "host" && !left
		? { hint: "Adibidez: kode.eus/menua" }
		: { error: ERRORS[result.reason] };
}

/** The code to show: the link's, or the placeholder's in the same design until the link is valid. */
function previewSvg(result: DesignQrCodeResult, design: QrDesign): string {
	if (result.status === "ready") {
		return result.svg;
	}
	const placeholder = designQrCode({ link: PLACEHOLDER_LINK, design }, { encoder });
	return placeholder.status === "ready" ? placeholder.svg : "";
}

function QrPreview({ result, svg }: { readonly result: DesignQrCodeResult; readonly svg: string }) {
	const ready = result.status === "ready";
	const label = ready
		? `QR kodearen aurrebista: ${result.link}`
		: "QR kodearen aurrebista, esteka baliozko baten zain";
	const markup = useMemo(() => ({ __html: svg }), [svg]);
	return (
		<div
			// Inline SVG rather than an <img>, so the frame text uses the page's Unbounded font.
			// oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- an <img> can't use the page's fonts
			role="img"
			aria-label={label}
			className={`w-[250px] max-w-full self-center [&>svg]:block [&>svg]:h-auto [&>svg]:w-full ${ready ? "" : "opacity-20"}`}
			dangerouslySetInnerHTML={markup}
		/>
	);
}

type DesignTab = "markoa" | "forma";

const DESIGN_TABS = [
	{ id: "markoa", label: "Markoa" },
	{ id: "forma", label: "Forma" },
] as const;

const STEP = "m-0 flex min-w-0 flex-col border-0 p-0";

function DesignStep({
	design,
	onChange,
}: {
	readonly design: QrDesign;
	readonly onChange: DesignChange;
}) {
	const [tab, setTab] = useState<DesignTab>("markoa");
	return (
		<fieldset aria-labelledby="urratsa-diseinua" className={`${STEP} gap-space-4`}>
			<StepLabel step={2} id="urratsa-diseinua">
				Diseinua
			</StepLabel>
			<Tabs
				items={DESIGN_TABS}
				value={tab}
				onChange={setTab}
				label="Diseinua"
				idPrefix="diseinua"
			/>
			<TabPanel
				id="markoa"
				idPrefix="diseinua"
				selected={tab === "markoa"}
				className="pt-space-2"
			>
				<FramePanel design={design} onChange={onChange} />
			</TabPanel>
			<TabPanel
				id="forma"
				idPrefix="diseinua"
				selected={tab === "forma"}
				className="pt-space-2"
			>
				<ShapePanel design={design} onChange={onChange} />
			</TabPanel>
		</fieldset>
	);
}

/** The QR code generator: paste a link, design the code and see it as it will be saved. */
export function QrGenerator() {
	const [link, setLink] = useState("");
	const [left, setLeft] = useState(false);
	const [design, setDesign] = useState<QrDesign>(DEFAULT_DESIGN);
	const result = useMemo(() => designQrCode({ link, design }, { encoder }), [link, design]);
	const preview = useMemo(
		() => <QrPreview result={result} svg={previewSvg(result, design)} />,
		[result, design],
	);
	const leaveField = useCallback(() => {
		setLeft(true);
	}, []);
	const changeDesign = useCallback<DesignChange>((key, value) => {
		setDesign((current) => ({ ...current, [key]: value }));
	}, []);

	return (
		<TicketCard label="QR sortzailea" side={preview}>
			<fieldset aria-labelledby="urratsa-esteka" className={`${STEP} gap-space-3`}>
				<StepLabel step={1} id="urratsa-esteka">
					Esteka
				</StepLabel>
				<UrlField
					id="esteka"
					label="Nora eraman behar du zure QRak?"
					value={link}
					onChange={setLink}
					onBlur={leaveField}
					{...fieldMessages(result, left)}
				/>
			</fieldset>
			<DesignStep design={design} onChange={changeDesign} />
		</TicketCard>
	);
}
