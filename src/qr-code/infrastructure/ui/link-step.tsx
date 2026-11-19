import { useCallback, useState } from "react";

import { StepLabel } from "@/shared/ui/step-label";
import { UrlField } from "@/shared/ui/url-field";

import type { DesignQrCodeResult } from "../../application/design-qr-code";
import type { InvalidLinkReason } from "../../domain/parse-link";
import type { ContentProblem } from "../../domain/qr-content";

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
	if (result.status === "ready" && result.encoded.type === "esteka") {
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

/** Step 1, "Esteka": the link field, with what the code will open or why it can't. */
export function LinkStep({
	link,
	onChange,
	result,
}: {
	readonly link: string;
	readonly onChange: (link: string) => void;
	readonly result: DesignQrCodeResult;
}) {
	const [left, setLeft] = useState(false);
	const leaveField = useCallback(() => {
		setLeft(true);
	}, []);
	return (
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
				onChange={onChange}
				onBlur={leaveField}
				{...fieldMessages(result, left)}
			/>
		</fieldset>
	);
}
