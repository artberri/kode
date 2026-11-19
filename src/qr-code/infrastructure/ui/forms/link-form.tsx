import { useCallback, useState } from "react";

import { UrlField } from "@/shared/ui/url-field";

import type { DesignQrCodeResult } from "../../../application/design-qr-code";
import type { InvalidLinkReason } from "../../../domain/parse-link";
import type { ContentProblem } from "../../../domain/qr-content";
import type { ContentFormProps } from "./content-form";

const ERRORS: Record<InvalidLinkReason, string> = {
	scheme: "Estekak http:// edo https:// izan behar du. Adibidez: kode.eus",
	host: "Helbide hori ez da baliozkoa. Adibidez: kode.eus",
	spaces: "Estekak ezin du hutsunerik izan. Adibidez: kode.eus/nire-menua",
	"too-long": "Esteka luzeegia da: gehienez 1000 karaktere.",
};

/** The link's own reason; a payload over the byte limit reads as a link that is too long. */
function linkReason(problems: readonly ContentProblem[]): InvalidLinkReason {
	const [problem] = problems;
	return problem?.field === "link" ? problem.reason : "too-long";
}

type FieldMessages =
	| { readonly hint: string }
	| { readonly success: string }
	| { readonly error: string };

function fieldMessages(result: DesignQrCodeResult, left: boolean): FieldMessages {
	if (result.status === "empty") {
		return { hint: "Itsatsi esteka bat zure QRa sortzeko." };
	}
	if (result.status === "ready" && result.encoded.type === "link") {
		const { link, schemeAdded } = result.encoded;
		return schemeAdded
			? { success: `https:// gehitu diogu hasieran: ${link}` }
			: { success: `Zure QRak esteka hau irekiko du: ${link}` };
	}
	const reason = linkReason(result.status === "invalid" ? result.problems : []);
	// "kode" is a host without a dot until ".eus" is typed: only call it wrong once the field is left.
	return reason === "host" && !left
		? { hint: "Adibidez: kode.eus/menua" }
		: { error: ERRORS[reason] };
}

/** Esteka: the link field, with what the code will open or why it can't. */
export function LinkForm({ content, onChange, result }: ContentFormProps<"link">) {
	const [left, setLeft] = useState(false);
	const leaveField = useCallback(() => {
		setLeft(true);
	}, []);
	const changeLink = useCallback(
		(link: string) => {
			onChange({ type: "link", link });
		},
		[onChange],
	);
	return (
		<UrlField
			id="link"
			label="Nora eraman behar du zure QRak?"
			value={content.link}
			onChange={changeLink}
			onBlur={leaveField}
			{...fieldMessages(result, left)}
		/>
	);
}
