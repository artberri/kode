import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Home from "./page";

describe("the home page", () => {
	it("opens with the headline, the lead and a link to the generator", () => {
		render(<Home />);
		expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
			"QR kodeak.Euskaraz.Doan.",
		);
		expect(
			screen.getByText(
				"Itsatsi esteka, jolastu markoarekin, formekin eta koloreekin, eta deskargatu. Konturik gabe, eta dena zure nabigatzailean.",
			),
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Hasi orain" })).toHaveAttribute(
			"href",
			"#sortzailea",
		);
		expect(document.querySelector("#sortzailea")).toContainElement(
			screen.getByRole("region", { name: "QR sortzailea" }),
		);
	});

	it("shows a sample code that scans to kode.eus", () => {
		render(<Home />);
		const sample = screen.getByRole("img", { name: "QR kodearen adibidea: https://kode.eus/" });
		expect(sample).toHaveAttribute("src", expect.stringMatching(/^data:image\/svg\+xml,/u));
	});

	it("says in the footer to love free software, linking to the source code", () => {
		render(<Home />);
		const footer = within(screen.getByRole("contentinfo"));
		expect(screen.getByRole("contentinfo")).toHaveTextContent(
			"Software librea maitatu, faxismoa gorrotatu",
		);
		expect(footer.getByRole("link", { name: "Software librea" })).toHaveAttribute(
			"href",
			"https://github.com/artberri/kode",
		);
	});

	it("credits the author in the footer, linking to the author's website", () => {
		render(<Home />);
		const footer = within(screen.getByRole("contentinfo"));
		expect(screen.getByRole("contentinfo")).toHaveTextContent(
			"Alberto Varelak desorduetan egina",
		);
		expect(footer.getByRole("link", { name: "Alberto Varela" })).toHaveAttribute(
			"href",
			"https://albertovarela.net/",
		);
	});
});
