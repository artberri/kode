"use client";

import { useCallback, useMemo, useState } from "react";

import { TicketCard } from "@/shared/ui/ticket-card";

import type { ExportQrCodeDependencies } from "../../application/export-qr-code";
import { DEFAULT_DESIGN, type QrDesign } from "../../domain/qr-design";
import { BROWSER_ADAPTERS } from "./browser-adapters";
import type { DesignChange } from "./design-panels";
import { DesignStep } from "./design-step";
import { DownloadStep } from "./download-step";
import { LinkStep } from "./link-step";
import { QrPreview, usePreview } from "./qr-preview";

/** The browser's adapters by default; tests pass in-memory fakes. */
export type QrGeneratorProps = Partial<
	Pick<ExportQrCodeDependencies, "rasterizer" | "saver" | "outliner">
>;

/** The QR code generator: paste a link, design the code, see it as it will be saved and save it. */
export function QrGenerator({
	rasterizer = BROWSER_ADAPTERS.rasterizer,
	saver = BROWSER_ADAPTERS.saver,
	outliner = BROWSER_ADAPTERS.outliner,
}: QrGeneratorProps) {
	const [link, setLink] = useState("");
	const [design, setDesign] = useState<QrDesign>(DEFAULT_DESIGN);
	const content = useMemo(() => ({ type: "esteka", link }) as const, [link]);
	const dependencies = useMemo(
		() => ({ encoder: BROWSER_ADAPTERS.encoder, rasterizer, saver, outliner }),
		[rasterizer, saver, outliner],
	);
	const { result, svg, undrawable } = usePreview({ content, design }, dependencies);
	const changeDesign = useCallback<DesignChange>((key, value) => {
		setDesign((current) => ({ ...current, [key]: value }));
	}, []);
	const preview = useMemo(() => <QrPreview result={result} svg={svg} />, [result, svg]);
	const side = useMemo(
		() => (
			<DownloadStep
				content={content}
				design={design}
				ready={result.status === "ready"}
				preview={preview}
				dependencies={dependencies}
			/>
		),
		[content, design, result.status, preview, dependencies],
	);

	return (
		<TicketCard label="QR sortzailea" side={side}>
			<LinkStep link={link} onChange={setLink} result={result} />
			<DesignStep design={design} undrawable={undrawable} onChange={changeDesign} />
		</TicketCard>
	);
}
