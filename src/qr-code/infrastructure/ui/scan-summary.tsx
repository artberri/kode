import { DensityMeter } from "@/shared/ui/density-meter";
import { Icon } from "@/shared/ui/icon";

import type { DesignQrCodeResult } from "../../application/design-qr-code";
import { scanSentenceOf } from "./content-types";

/**
 * Under the preview: the "Eskaneatzean:" line and the density meter, only while the content is
 * valid, so a sample or a dimmed code never claims to do anything.
 */
export function ScanSummary({ result }: { readonly result: DesignQrCodeResult }) {
	if (result.status !== "ready") {
		return null;
	}
	return (
		<>
			<p className="m-0 flex items-start gap-2.5 text-body">
				<Icon name="scan" className="text-violet" />
				{/* A link has no spaces to break at: let it wrap anywhere, or the card clips it. */}
				<span className="min-w-0 wrap-anywhere">
					<b>Eskaneatzean:</b> {scanSentenceOf(result.encoded)}
				</span>
			</p>
			<DensityMeter modules={result.modules} />
		</>
	);
}
