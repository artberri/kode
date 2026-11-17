"use client";

import { useCallback, useMemo, useState } from "react";

import { StepLabel } from "@/shared/ui/step-label";
import { TicketCard } from "@/shared/ui/ticket-card";
import { UrlField } from "@/shared/ui/url-field";

import { type DesignQrCodeResult, designQrCode } from "../../application/design-qr-code";
import type { InvalidLinkReason } from "../../domain/parse-link";
import { DEFAULT_DESIGN } from "../../domain/qr-design";
import { QrcodeGeneratorEncoder } from "../qrcode-generator-encoder";

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

function QrPreview({ result }: { readonly result: DesignQrCodeResult }) {
	const ready = result.status === "ready";
	const svg = ready ? result.svg : svgOfPlaceholder;
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

const placeholder = designQrCode({ link: PLACEHOLDER_LINK, design: DEFAULT_DESIGN }, { encoder });
const svgOfPlaceholder = placeholder.status === "ready" ? placeholder.svg : "";

/** The QR code generator: paste a link and see the code it makes. */
export function QrGenerator() {
	const [link, setLink] = useState("");
	const [left, setLeft] = useState(false);
	const result = useMemo(
		() => designQrCode({ link, design: DEFAULT_DESIGN }, { encoder }),
		[link],
	);
	const preview = useMemo(() => <QrPreview result={result} />, [result]);
	const leaveField = useCallback(() => {
		setLeft(true);
	}, []);

	return (
		<TicketCard label="QR sortzailea" side={preview}>
			<fieldset
				aria-labelledby="urratsa-esteka"
				className="m-0 flex min-w-0 flex-col gap-space-3 border-0 p-0"
			>
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
		</TicketCard>
	);
}
