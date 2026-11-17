import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { SwatchPicker } from "./swatch-picker";

type Palette = "morea" | "menda" | "gaua";

const ITEMS = [
	{ value: "morea", label: "Morea", color: "#6B3FA8" },
	{ value: "menda", label: "Menda", color: "#8EE6C9" },
	{ value: "gaua", label: "Gaua", color: "#2A1740" },
] as const;

function Harness() {
	const [value, setValue] = useState<Palette | undefined>("menda");
	return (
		<SwatchPicker
			name="paleta"
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
			"morea",
			"menda",
			"gaua",
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
				name="paleta"
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
				name="paleta"
				legend="Paleta"
				items={ITEMS}
				value={undefined}
				onChange={onChange}
			/>,
		);

		await user.click(screen.getByRole("radio", { name: "Morea" }));

		expect(onChange).toHaveBeenCalledExactlyOnceWith("morea");
	});
});
