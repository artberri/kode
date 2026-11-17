import type { FileSaver, SavedFile } from "../application/file-saver";

/** Safari starts the download after the click returns, so the blob's URL must outlive it a while. */
const REVOKE_AFTER_MS = 10_000;

/** Downloads a file through a temporary `<a download>` pointing at the blob. */
export class BrowserFileSaver implements FileSaver {
	save({ name, blob }: SavedFile): void {
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = name;
		link.hidden = true;
		// oxlint-disable-next-line unicorn/prefer-dom-node-append -- cloudflare-env.d.ts merges the Workers HTMLRewriter `Element.append(content)` into the DOM's Element, so `append(link)` doesn't type-check
		document.body.appendChild(link);
		link.click();
		link.remove();
		setTimeout(() => {
			URL.revokeObjectURL(url);
		}, REVOKE_AFTER_MS);
	}
}
