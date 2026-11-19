import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { DensityMeter } from "./density-meter";

const ARINA = "Arina: edozein mugikorrek erraz irakurriko du.";
const ERTAINA = "Ertaina: inprimatu gutxienez 3 cm-ko zabaleran.";
const TRINKOA = "Trinkoa: laburtu edukia edo inprimatu handiago.";

describe("DensityMeter", () => {
	it("shows the code's size in modules", () => {
		render(<DensityMeter modules={33} />);

		expect(screen.getByText("Dentsitatea")).toBeVisible();
		expect(screen.getByText("33×33 modulu")).toBeVisible();
	});

	it.each([
		{ modules: 21, sentence: ARINA },
		{ modules: 45, sentence: ARINA },
		{ modules: 46, sentence: ERTAINA },
		{ modules: 69, sentence: ERTAINA },
		{ modules: 70, sentence: TRINKOA },
		{ modules: 177, sentence: TRINKOA },
	])("says what to do with a $modules-module code", ({ modules, sentence }) => {
		render(<DensityMeter modules={modules} />);

		expect(screen.getByText(sentence)).toBeVisible();
	});

	it.each([
		{ modules: 45, filled: 1 },
		{ modules: 69, filled: 2 },
		{ modules: 70, filled: 3 },
	])("fills $filled of the bar's segments at $modules modules", ({ modules, filled }) => {
		const { container } = render(<DensityMeter modules={modules} />);

		const bar = container.querySelector("[aria-hidden='true']");
		expect(bar?.querySelectorAll("[data-filled]")).toHaveLength(filled);
	});

	it("hides the bar from assistive tech, as the words carry the level", () => {
		const { container } = render(<DensityMeter modules={57} />);

		expect(container.querySelector("[aria-hidden='true']")?.children).toHaveLength(3);
		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});
});
