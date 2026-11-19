import { parseLink } from "../parse-link";
import type { ContentEncoding, QrContent } from "../qr-content";

/** A link, normalised by `parseLink`: the code opens it. */
export function encodeLink({ link }: Extract<QrContent, { type: "link" }>): ContentEncoding {
	const parsed = parseLink(link);
	if (parsed.status === "empty") {
		return parsed;
	}
	if (parsed.status === "invalid") {
		return { status: "invalid", problems: [{ field: "link", reason: parsed.reason }] };
	}
	return {
		status: "valid",
		encoded: {
			type: "link",
			payload: parsed.link,
			link: parsed.link,
			schemeAdded: parsed.schemeAdded,
		},
	};
}
