// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";

import { BrowserFileSaver } from "./browser-file-saver";

function clickedLinks(): HTMLAnchorElement[] {
	const links: HTMLAnchorElement[] = [];
	document.addEventListener("click", (event) => {
		if (event.target instanceof HTMLAnchorElement) {
			links.push(event.target);
			// happy-dom would otherwise try to follow the link.
			event.preventDefault();
		}
	});
	return links;
}

describe("BrowserFileSaver", () => {
	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it("downloads the blob under its name through a temporary link", () => {
		const links = clickedLinks();

		new BrowserFileSaver().save({ name: "kode-qr.svg", blob: new Blob(["<svg/>"]) });

		expect(links.map((link) => link.download)).toEqual(["kode-qr.svg"]);
		expect(links[0]?.href).toMatch(/^blob:/u);
		expect(links[0]?.isConnected).toBe(false);
	});

	it("frees the blob's URL once the download has had time to start", () => {
		vi.useFakeTimers();
		const revoke = vi.spyOn(URL, "revokeObjectURL");
		const links = clickedLinks();

		new BrowserFileSaver().save({ name: "kode-qr.png", blob: new Blob(["png"]) });
		expect(revoke).not.toHaveBeenCalled();

		vi.runAllTimers();
		expect(revoke).toHaveBeenCalledExactlyOnceWith(links[0]?.href);
	});
});
