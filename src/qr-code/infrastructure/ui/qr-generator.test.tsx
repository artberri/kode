import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { QrGenerator } from "./qr-generator";

const FIELD = "Nora eraman behar du zure QRak?";
const FRAME_TEXT = "Markoaren testua";
const PREVIEW = /^QR kodearen aurrebista/u;

function setup(): { user: ReturnType<typeof userEvent.setup> } {
	const user = userEvent.setup();
	render(<QrGenerator />);
	return { user };
}

function preview(): HTMLElement {
	return screen.getByRole("img", { name: PREVIEW });
}

async function openColours(): Promise<ReturnType<typeof userEvent.setup>> {
	const { user } = setup();
	await user.click(screen.getByRole("tab", { name: "Koloreak" }));
	return user;
}

function pickColour(label: string, hex: string): void {
	fireEvent.change(screen.getByLabelText(label), { target: { value: hex } });
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

	it("opens the design step on the Markoa tab, with the default design chosen", () => {
		setup();

		const step = screen.getByRole("group", { name: "2 · Diseinua" });
		expect(within(step).getByRole("tab", { name: "Markoa", selected: true })).toBeVisible();
		expect(within(step).getByRole("radio", { name: "Zigilua" })).toBeChecked();
		expect(within(step).getByRole("textbox", { name: FRAME_TEXT })).toHaveValue("Eskaneatu");
	});

	it.each([
		{ tab: "Markoa", group: "Markoa", option: "Markorik ez" },
		{ tab: "Markoa", group: "Markoa", option: "Etiketa" },
		{ tab: "Markoa", group: "Markoa", option: "Arbela" },
		{ tab: "Markoa", group: "Markoa", option: "Tiketa" },
		{ tab: "Forma", group: "Puntuen forma", option: "Karratuak" },
		{ tab: "Forma", group: "Puntuen forma", option: "Leunak" },
		{ tab: "Forma", group: "Puntuen forma", option: "Diamanteak" },
		{ tab: "Forma", group: "Izkinen markoa", option: "Karratua" },
		{ tab: "Forma", group: "Izkinen markoa", option: "Borobildua" },
		{ tab: "Forma", group: "Izkinen erdigunea", option: "Karratua" },
		{ tab: "Forma", group: "Izkinen erdigunea", option: "Borobildua" },
	])("redraws the preview when $group is set to $option", async ({ tab, group, option }) => {
		const { user } = setup();
		await user.type(screen.getByRole("textbox", { name: FIELD }), "kode.eus");
		await user.click(screen.getByRole("tab", { name: tab }));
		const before = preview().innerHTML;

		const choice = within(screen.getByRole("group", { name: group })).getByRole("radio", {
			name: option,
		});
		await user.click(choice);

		expect(choice).toBeChecked();
		expect(preview().innerHTML).not.toBe(before);
	});

	it("follows the design in the dimmed preview before there is a link", async () => {
		const { user } = setup();
		const before = preview().innerHTML;

		await user.click(screen.getByRole("radio", { name: "Etiketa" }));

		expect(preview().innerHTML).not.toBe(before);
	});

	it("cuts the frame text at 16 characters and counts them", async () => {
		const { user } = setup();
		const field = screen.getByRole("textbox", { name: FRAME_TEXT });

		await user.clear(field);
		await user.type(field, "Begiratu gure menua");

		expect(field).toHaveValue("Begiratu gure me");
		expect(screen.getByText("16/16")).toBeVisible();
		expect(within(preview()).getByText("Begiratu gure me")).toBeInTheDocument();
	});

	it("hides the frame text without a frame, and draws no label", async () => {
		const { user } = setup();

		await user.click(screen.getByRole("radio", { name: "Markorik ez" }));

		expect(screen.queryByRole("textbox", { name: FRAME_TEXT })).not.toBeInTheDocument();
		expect(within(preview()).queryByText("Eskaneatu")).not.toBeInTheDocument();

		await user.click(screen.getByRole("radio", { name: "Etiketa" }));
		expect(screen.getByRole("textbox", { name: FRAME_TEXT })).toHaveValue("Eskaneatu");
	});

	it("opens the colours on the Morea palette, with no warning", async () => {
		await openColours();

		expect(screen.getByRole("radio", { name: "Morea" })).toBeChecked();
		expect(screen.getByLabelText("QRaren kolorea")).toHaveAccessibleDescription("#2A1740");
		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});

	it("sets the four colours from a palette and selects it", async () => {
		const user = await openColours();

		await user.click(screen.getByRole("radio", { name: "Menda" }));

		expect(screen.getByRole("radio", { name: "Menda" })).toBeChecked();
		expect(screen.getByLabelText("Markoaren kolorea")).toHaveAccessibleDescription("#8EE6C9");
		expect(screen.getByLabelText("Testuaren kolorea")).toHaveAccessibleDescription("#2A1740");
		expect(preview().innerHTML).toContain('"#8EE6C9"');
	});

	it("leaves no palette selected once a colour is changed by hand", async () => {
		await openColours();

		pickColour("Markoaren kolorea", "#123456");

		const palettes = within(screen.getByRole("group", { name: "Paleta" }));
		expect(palettes.getAllByRole("radio").filter((radio) => radio.matches(":checked"))).toEqual(
			[],
		);
		expect(screen.getByLabelText("Markoaren kolorea")).toHaveAccessibleDescription("#123456");
		expect(preview().innerHTML).toContain('"#123456"');
	});

	it("warns when the QR is lighter than its background", async () => {
		await openColours();

		pickColour("QRaren kolorea", "#ffffff");
		pickColour("Hondoaren kolorea", "#2a1740");

		expect(screen.getByRole("status")).toHaveTextContent(
			"Kolore argia hondo ilunaren gainean: kamera askok hobeto irakurtzen dute iluna argiaren gainean.",
		);
	});

	it("warns when the QR and its background are too alike, until they are not", async () => {
		await openColours();

		pickColour("QRaren kolorea", "#cdb8ff");
		expect(screen.getByRole("status")).toHaveTextContent(
			"Kontraste txikia: baliteke mugikor batzuek QRa ez irakurtzea. Erabili kolore ilunagoa hondo argiaren gainean.",
		);

		pickColour("QRaren kolorea", "#2a1740");
		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});
});
