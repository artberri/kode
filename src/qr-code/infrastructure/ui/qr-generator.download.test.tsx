import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BoxFrameTextOutliner } from "../box-frame-text-outliner";
import { BrokenRasterizer, downloadButton, FIELD, setup, typeLink } from "./qr-generator.harness";

describe("QrGenerator's download step", () => {
	it("downloads kode-esteka.png, and the button follows the chosen format", async () => {
		const { user, saver } = setup({ outliner: new BoxFrameTextOutliner() });
		await typeLink(user);

		await user.click(screen.getByRole("button", { name: "Deskargatu PNG" }));
		expect(await screen.findByText("Deskargatuta: kode-esteka.png")).toBeVisible();
		expect(saver.saved.map((file) => file.name)).toEqual(["kode-esteka.png"]);

		await user.click(screen.getByRole("radio", { name: "SVG" }));
		await user.click(screen.getByRole("button", { name: "Deskargatu SVG" }));
		expect(await screen.findByText("Deskargatuta: kode-esteka.svg")).toBeVisible();
		expect(saver.saved.map((file) => file.name)).toEqual([
			"kode-esteka.png",
			"kode-esteka.svg",
		]);
	});

	it("labels the download step and starts on PNG", () => {
		setup();

		const step = screen.getByRole("group", { name: "3 · Deskarga" });
		expect(within(step).getByRole("radio", { name: "PNG" })).toBeChecked();
		expect(within(step).getByRole("button", { name: "Deskargatu PNG" })).toBeVisible();
	});

	it("keeps the download disabled until the link is valid", async () => {
		const { user } = setup();
		expect(downloadButton()).toBeDisabled();

		await typeLink(user, "ftp://kode.eus");
		expect(downloadButton()).toBeDisabled();

		await user.clear(screen.getByRole("textbox", { name: FIELD }));
		await typeLink(user);
		expect(downloadButton()).toBeEnabled();
	});

	it("disables WebP where the browser can't encode it, and says why", async () => {
		setup({ webp: false });

		expect(await screen.findByRole("radio", { name: "WebP" })).toBeDisabled();
		expect(screen.getByRole("group", { name: "Formatua" })).toHaveAccessibleDescription(
			"Nabigatzaile honek ezin du WebP sortu. Aukeratu PNG edo SVG.",
		);
		expect(screen.getByRole("radio", { name: "PNG" })).toBeEnabled();
	});

	it("says so when a download fails, and saves nothing", async () => {
		const { user, saver } = setup({
			outliner: new BoxFrameTextOutliner(),
			rasterizer: new BrokenRasterizer(),
		});
		await typeLink(user);

		await user.click(downloadButton());

		expect(
			await screen.findByText("Ezin izan dugu QRa deskargatu. Saiatu berriro."),
		).toBeVisible();
		expect(saver.saved).toEqual([]);
	});

	it("forgets the last download once the design changes", async () => {
		const { user } = setup({ outliner: new BoxFrameTextOutliner() });
		await typeLink(user);
		await user.click(downloadButton());
		const message = await screen.findByText("Deskargatuta: kode-esteka.png");

		await user.click(screen.getByRole("radio", { name: "Etiketa" }));

		expect(message).not.toBeInTheDocument();
	});
});
