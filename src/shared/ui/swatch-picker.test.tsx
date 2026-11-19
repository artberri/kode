import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { SwatchPicker } from "./swatch-picker";

type Palette = "violet" | "mint" | "night";

const ITEMS = [
	{ value: "violet", label: "Morea", color: "#6B3FA8" },
	{ value: "mint", label: "Menda", color: "#8EE6C9" },
	{ value: "night", label: "Gaua", color: "#2A1740" },
] as const;

function Harness() {
	const [value, setValue] = useState<Palette | undefined>("mint");
	return (
		<SwatchPicker
			name="palette"
			legend="Paleta"
			items={ITEMS}
			value={value}
			onChange={setValue}
		/>
	);
}

describe("SwatchPicker", () => {
	it("is a radio group named by its legend, with swatches named by their colour", () => {
		render(<Harness />);

		expect(screen.getByRole("group", { name: "Paleta" })).toBeVisible();
		expect(screen.getAllByRole("radio").map((radio) => radio.getAttribute("value"))).toEqual([
			"violet",
			"mint",
			"night",
		]);
		expect(screen.getByRole("radio", { name: "Menda" })).toBeChecked();
	});

	it("fills each swatch with its colour", () => {
		render(<Harness />);

		const swatch = screen.getByRole("radio", { name: "Gaua" }).closest("label");
		expect(swatch?.querySelector("circle")).toHaveAttribute("fill", "#2A1740");
	});

	it("changes the choice with the arrow keys", async () => {
		const user = userEvent.setup();
		render(<Harness />);
		await user.click(screen.getByRole("radio", { name: "Menda" }));

		await user.keyboard("{ArrowRight}");

		expect(screen.getByRole("radio", { name: "Gaua" })).toBeChecked();
	});

	it("can have no swatch chosen, when the colours match no preset", () => {
		render(
			<SwatchPicker
				name="palette"
				legend="Paleta"
				items={ITEMS}
				value={undefined}
				onChange={vi.fn<(value: Palette) => void>()}
			/>,
		);

		expect(screen.getByRole("radio", { name: "Morea" })).not.toBeChecked();
		expect(screen.getByRole("radio", { name: "Menda" })).not.toBeChecked();
		expect(screen.getByRole("radio", { name: "Gaua" })).not.toBeChecked();
	});

	it("calls onChange with the picked value", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn<(value: Palette) => void>();
		render(
			<SwatchPicker
				name="palette"
				legend="Paleta"
				items={ITEMS}
				value={undefined}
				onChange={onChange}
			/>,
		);

		await user.click(screen.getByRole("radio", { name: "Morea" }));

		expect(onChange).toHaveBeenCalledExactlyOnceWith("violet");
	});
});
