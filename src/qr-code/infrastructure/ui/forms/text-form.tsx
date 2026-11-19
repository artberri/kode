import { useCallback } from "react";

import { TextArea } from "@/shared/ui/text-area";

import type { DesignQrCodeResult } from "../../../application/design-qr-code";
import type { ContentFormProps } from "./content-form";

/** The most a text may hold, as the design system sets for free text. */
const MAX_TEXT_LENGTH = 500;

/**
 * Cutting n characters cuts at least n bytes, so saying the excess in bytes as characters is
 * always enough.
 */
function errorOf(result: DesignQrCodeResult): string | undefined {
	if (result.status !== "invalid") {
		return undefined;
	}
	const tooLong = result.problems.find((problem) => problem.field === "payload");
	return tooLong === undefined
		? undefined
		: `Testu luzeegia QR baterako: kendu ${String(tooLong.excessBytes)} karaktere.`;
}

/** Testua: the text the code holds, as typed. */
export function TextForm({ content, onChange, result }: ContentFormProps<"text">) {
	const changeText = useCallback(
		(text: string) => {
			onChange({ type: "text", text });
		},
		[onChange],
	);
	return (
		<TextArea
			id="text"
			label="Zure testua"
			value={content.text}
			onChange={changeText}
			maxLength={MAX_TEXT_LENGTH}
			hint="Testua bera gordetzen da QRan: ez du ezer irekitzen."
			error={errorOf(result)}
		/>
	);
}
