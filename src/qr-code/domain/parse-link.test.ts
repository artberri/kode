import { afterEach, describe, expect, it } from "vitest";

import { parseLink } from "./parse-link";

describe("parseLink", () => {
	it("treats an empty or blank field as empty", () => {
		expect(parseLink("")).toEqual({ status: "empty" });
		expect(parseLink("   \t ")).toEqual({ status: "empty" });
	});

	it("keeps an http or https link and normalises it", () => {
		expect(parseLink("https://kode.eus")).toEqual({
			status: "valid",
			link: "https://kode.eus/",
			schemeAdded: false,
		});
		expect(parseLink("http://kode.eus/menua?a=1#b")).toEqual({
			status: "valid",
			link: "http://kode.eus/menua?a=1#b",
			schemeAdded: false,
		});
	});

	it("trims the surrounding whitespace", () => {
		expect(parseLink("  https://kode.eus/menua \n")).toEqual({
			status: "valid",
			link: "https://kode.eus/menua",
			schemeAdded: false,
		});
	});

	it("accepts an uppercase scheme and host", () => {
		expect(parseLink("HTTPS://KODE.EUS/Menua")).toEqual({
			status: "valid",
			link: "https://kode.eus/Menua",
			schemeAdded: false,
		});
	});

	it("adds https:// to a link typed without a scheme", () => {
		expect(parseLink("kode.eus/menua")).toEqual({
			status: "valid",
			link: "https://kode.eus/menua",
			schemeAdded: true,
		});
		expect(parseLink("kode.eus:8080/menua")).toEqual({
			status: "valid",
			link: "https://kode.eus:8080/menua",
			schemeAdded: true,
		});
	});

	it("rejects a scheme other than http or https", () => {
		expect(parseLink("ftp://kode.eus/fitxategia")).toEqual({
			status: "invalid",
			reason: "scheme",
		});
		expect(parseLink("mailto:kaixo@kode.eus")).toEqual({ status: "invalid", reason: "scheme" });
		expect(parseLink("javascript:alert(1)")).toEqual({ status: "invalid", reason: "scheme" });
	});

	it("rejects a host without a dot", () => {
		expect(parseLink("localhost")).toEqual({ status: "invalid", reason: "host" });
		expect(parseLink("http://localhost:3000/")).toEqual({ status: "invalid", reason: "host" });
		expect(parseLink("https://")).toEqual({ status: "invalid", reason: "host" });
	});

	it("rejects a link with spaces", () => {
		expect(parseLink("kode.eus/nire menua")).toEqual({ status: "invalid", reason: "spaces" });
		expect(parseLink("https://kode .eus")).toEqual({ status: "invalid", reason: "spaces" });
	});

	it("rejects a link longer than 1000 characters", () => {
		const base = "https://kode.eus/";
		const atLimit = base + "a".repeat(1000 - base.length);
		expect(parseLink(atLimit)).toMatchObject({ status: "valid" });
		expect(parseLink(`${atLimit}a`)).toEqual({ status: "invalid", reason: "too-long" });
	});

	it("rejects a link that grows past 1000 characters once encoded", () => {
		expect(parseLink(`https://kode.eus/${"ñ".repeat(300)}`)).toEqual({
			status: "invalid",
			reason: "too-long",
		});
	});

	describe("on browsers without URL.parse (Safari 16.4 to 17, Chrome and Firefox 111 to 125)", () => {
		const original = Object.getOwnPropertyDescriptor(URL, "parse");

		afterEach(() => {
			if (original !== undefined) {
				Object.defineProperty(URL, "parse", original);
			}
		});

		it("still parses links", () => {
			Reflect.deleteProperty(URL, "parse");
			expect(parseLink("kode.eus/menua")).toEqual({
				status: "valid",
				link: "https://kode.eus/menua",
				schemeAdded: true,
			});
			expect(parseLink("https://")).toEqual({ status: "invalid", reason: "host" });
		});
	});
});
