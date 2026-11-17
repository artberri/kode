import { render, screen } from "@testing-library/react";
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

	it("credits the QR Code trademark in the footer", () => {
		render(<Home />);
		expect(screen.getByRole("contentinfo")).toHaveTextContent(
			"QR Code DENSO WAVE Incorporated-en marka erregistratua da.",
		);
	});
});
