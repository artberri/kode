import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { ChoiceChips, type ChoiceChipsProps } from "./choice-chips";

type Kind = "link" | "text" | "wifi";

const ITEMS = [
	{ value: "link", label: "Esteka", icon: "link" },
	{ value: "text", label: "Testua", icon: "text" },
	{ value: "wifi", label: "WiFi" },
] as const;

const LEGEND = "Zer partekatu nahi duzu?";

function Harness(props: Partial<Pick<ChoiceChipsProps<Kind>, "hideLegend" | "hint">>) {
	const [value, setValue] = useState<Kind>("link");
	return (
		<ChoiceChips
			name="mota"
			legend={LEGEND}
			items={ITEMS}
			value={value}
			onChange={setValue}
			{...props}
		/>
	);
}

function iconOf(name: string): SVGElement | null | undefined {
	return screen.getByRole("radio", { name }).closest("label")?.querySelector("svg");
}

describe("ChoiceChips", () => {
	it("is a radio group named by its visible legend, with the value checked", () => {
		render(<Harness />);

		expect(screen.getByRole("group", { name: LEGEND })).toBeVisible();
		expect(screen.getByText(LEGEND)).not.toHaveClass("sr-only");
		expect(screen.getAllByRole("radio").map((radio) => radio.getAttribute("value"))).toEqual([
			"link",
			"text",
			"wifi",
		]);
		expect(screen.getByRole("radio", { name: "Esteka" })).toBeChecked();
	});

	it("keeps the legend for screen readers only when asked", () => {
		render(<Harness hideLegend />);

		expect(screen.getByRole("group", { name: LEGEND })).toBeVisible();
		expect(screen.getByText(LEGEND)).toHaveClass("sr-only");
	});

	it("draws an icon only for the items that have one, hidden from assistive tech", () => {
		render(<Harness />);

		expect(iconOf("Esteka")).toHaveAttribute("aria-hidden", "true");
		expect(iconOf("Testua")).toHaveAttribute("aria-hidden", "true");
		expect(iconOf("WiFi")).toBeNull();
	});

	it("changes the choice with the arrow keys", async () => {
		const user = userEvent.setup();
		render(<Harness />);
		await user.click(screen.getByRole("radio", { name: "Esteka" }));

		await user.keyboard("{ArrowRight}");
		expect(screen.getByRole("radio", { name: "Testua" })).toBeChecked();

		await user.keyboard("{ArrowRight}");
		expect(screen.getByRole("radio", { name: "WiFi" })).toBeChecked();
	});

	it("calls onChange with the picked value", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn<(value: Kind) => void>();
		render(
			<ChoiceChips
				name="mota"
				legend={LEGEND}
				items={ITEMS}
				value="link"
				onChange={onChange}
			/>,
		);

		await user.click(screen.getByRole("radio", { name: "Testua" }));

		expect(onChange).toHaveBeenCalledExactlyOnceWith("text");
	});

	it("describes the group with its hint", () => {
		render(<Harness hint="Aukeratu mota bat." />);

		expect(screen.getByRole("group", { name: LEGEND })).toHaveAccessibleDescription(
			"Aukeratu mota bat.",
		);
	});
});
