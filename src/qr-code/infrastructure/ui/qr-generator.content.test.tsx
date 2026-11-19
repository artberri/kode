import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import {
	downloadButton,
	FIELD,
	pickType,
	preview,
	setup,
	TEXT_FIELD,
	TYPES,
	typeLink,
} from "./qr-generator.harness";

/** The "Eskaneatzean:" line on the download side, if it shows. */
function scanLine(): HTMLElement | null {
	return screen.queryByText("Eskaneatzean:")?.closest("p") ?? null;
}

describe("QrGenerator's content types", () => {
	it("opens on the type pills with Esteka checked, listing only the types that work", () => {
		setup();

		const types = within(screen.getByRole("group", { name: TYPES }));
		expect(types.getAllByRole("radio").map((radio) => radio.getAttribute("value"))).toEqual([
			"link",
			"text",
		]);
		expect(types.getByRole("radio", { name: "Esteka" })).toBeChecked();
	});

	it("shows the chosen type's field in place of the link's", async () => {
		const { user } = setup();

		await pickType(user, "Testua");

		expect(screen.getByRole("textbox", { name: TEXT_FIELD })).toHaveAccessibleDescription(
			"Testua bera gordetzen da QRan: ez du ezer irekitzen.",
		);
		expect(screen.queryByRole("textbox", { name: FIELD })).not.toBeInTheDocument();
		expect(screen.getByText("0/500")).toBeVisible();
	});

	it("keeps what was typed in each type while switching, and the preview follows", async () => {
		const { user } = setup();
		await typeLink(user);
		await pickType(user, "Testua");

		expect(screen.getByRole("textbox", { name: TEXT_FIELD })).toHaveValue("");
		expect(preview()).toHaveAccessibleName(
			"QR kodearen aurrebista (adibidea): https://kode.eus/",
		);
		await user.type(screen.getByRole("textbox", { name: TEXT_FIELD }), "Kaixo{Enter}Goñi");
		expect(preview()).toHaveAccessibleName("QR kodearen aurrebista: testua");

		await pickType(user, "Esteka");
		expect(screen.getByRole("textbox", { name: FIELD })).toHaveValue("kode.eus");
		expect(preview()).toHaveAccessibleName("QR kodearen aurrebista: https://kode.eus/");

		await pickType(user, "Testua");
		expect(screen.getByRole("textbox", { name: TEXT_FIELD })).toHaveValue("Kaixo\nGoñi");
		expect(downloadButton()).toBeEnabled();
	});

	it("counts a text of only whitespace as empty: no error, and the sample shows", async () => {
		const { user } = setup();
		await pickType(user, "Testua");

		await user.type(screen.getByRole("textbox", { name: TEXT_FIELD }), "   ");

		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
		expect(preview()).toHaveAccessibleName(
			"QR kodearen aurrebista (adibidea): https://kode.eus/",
		);
		expect(downloadButton()).toBeDisabled();
	});

	it("stops the text at 500 characters", async () => {
		const { user } = setup();
		await pickType(user, "Testua");
		const field = screen.getByRole("textbox", { name: TEXT_FIELD });

		await user.click(field);
		await user.paste("a".repeat(501));

		expect(field).toHaveValue("a".repeat(500));
		expect(screen.getByText("500/500")).toBeVisible();
	});

	it("says how much to cut from a text over 1000 bytes, and dims the preview", async () => {
		const { user } = setup();
		await pickType(user, "Testua");
		const field = screen.getByRole("textbox", { name: TEXT_FIELD });

		// 340 euro signs of three bytes each: 1020 bytes.
		await user.click(field);
		await user.paste("€".repeat(340));

		expect(screen.getByRole("alert")).toHaveTextContent(
			"Testu luzeegia QR baterako: kendu 20 karaktere.",
		);
		expect(field).toBeInvalid();
		const waiting = screen.getByRole("img", {
			name: "QR kodearen aurrebista, testu laburrago baten zain",
		});
		expect(waiting).toHaveClass("opacity-20");
		expect(downloadButton()).toBeDisabled();
	});

	it("says what scanning a text does, and how dense its code is", async () => {
		const { user } = setup();
		await pickType(user, "Testua");

		await user.type(screen.getByRole("textbox", { name: TEXT_FIELD }), "Kaixo");

		expect(scanLine()).toHaveTextContent(
			"Eskaneatzean: testua pantailan erakutsiko du, kopiatzeko prest.",
		);
		expect(screen.getByText("21×21 modulu")).toBeVisible();
		expect(screen.getByText("Arina: edozein mugikorrek erraz irakurriko du.")).toBeVisible();
	});

	it("says which link scanning opens", async () => {
		const { user } = setup();

		await typeLink(user);

		expect(scanLine()).toHaveTextContent(
			"Eskaneatzean: https://kode.eus/ irekiko du nabigatzailean.",
		);
		expect(screen.getByText("25×25 modulu")).toBeVisible();
	});

	it("leaves out the scan line and the density while the content is empty or invalid", async () => {
		const { user } = setup();
		expect(scanLine()).not.toBeInTheDocument();
		expect(screen.queryByText("Dentsitatea")).not.toBeInTheDocument();

		await typeLink(user, "localhost:3000");
		await user.tab();

		expect(scanLine()).not.toBeInTheDocument();
		expect(screen.queryByText("Dentsitatea")).not.toBeInTheDocument();
	});
});
