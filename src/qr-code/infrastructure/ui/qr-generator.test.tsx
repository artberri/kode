import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { QrGenerator } from "./qr-generator";

const FIELD = "Nora eraman behar du zure QRak?";

function setup(): { user: ReturnType<typeof userEvent.setup> } {
	const user = userEvent.setup();
	render(<QrGenerator />);
	return { user };
}

describe("QrGenerator", () => {
	it("says https:// was added and names the preview with the full link", async () => {
		const { user } = setup();
		await user.type(screen.getByRole("textbox", { name: FIELD }), "kode.eus");

		expect(screen.getByRole("textbox", { name: FIELD })).toHaveAccessibleDescription(
			"https:// gehitu diogu hasieran: https://kode.eus/",
		);
		expect(
			screen.getByRole("img", { name: "QR kodearen aurrebista: https://kode.eus/" }),
		).toBeVisible();
	});

	it("confirms a link that already has its scheme", async () => {
		const { user } = setup();
		await user.type(screen.getByRole("textbox", { name: FIELD }), "https://kode.eus/menua");

		expect(screen.getByRole("textbox", { name: FIELD })).toHaveAccessibleDescription(
			"Zure QRak esteka hau irekiko du: https://kode.eus/menua",
		);
	});

	it("announces an error for a scheme other than http or https", async () => {
		const { user } = setup();
		await user.type(screen.getByRole("textbox", { name: FIELD }), "ftp://x");

		expect(screen.getByRole("alert")).toHaveTextContent(
			"Estekak http:// edo https:// izan behar du. Adibidez: kode.eus",
		);
		expect(screen.getByRole("textbox", { name: FIELD })).toBeInvalid();
		expect(
			screen.getByRole("img", { name: "QR kodearen aurrebista, esteka baliozko baten zain" }),
		).toBeVisible();
	});

	it("waits until the field is left before calling a half-typed host wrong", async () => {
		const { user } = setup();
		await user.type(screen.getByRole("textbox", { name: FIELD }), "kode");

		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
		expect(screen.getByRole("textbox", { name: FIELD })).toHaveAccessibleDescription(
			"Adibidez: kode.eus/menua",
		);

		await user.tab();
		expect(screen.getByRole("alert")).toHaveTextContent(
			"Helbide hori ez da baliozkoa. Adibidez: kode.eus",
		);
	});

	it("prompts for a link while the field is empty, without an error", () => {
		setup();

		expect(screen.getByRole("textbox", { name: FIELD })).toHaveAccessibleDescription(
			"Itsatsi esteka bat zure QRa sortzeko.",
		);
		expect(screen.getByRole("textbox", { name: FIELD })).toBeValid();
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
		expect(
			screen.getByRole("img", { name: "QR kodearen aurrebista, esteka baliozko baten zain" }),
		).toBeVisible();
	});

	it("labels the link step", () => {
		setup();

		expect(screen.getByRole("group", { name: "1 · Esteka" })).toContainElement(
			screen.getByRole("textbox", { name: FIELD }),
		);
	});
});
