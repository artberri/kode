import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { OptionTiles, type OptionTilesProps } from "./option-tiles";

type Shape = "karratua" | "borobildua" | "zirkulua";

const ITEMS = [
	{ value: "karratua", label: "Karratua", icon: <svg data-testid="ikonoa" /> },
	{ value: "borobildua", label: "Borobildua", icon: <svg /> },
	{ value: "zirkulua", label: "Zirkulua", icon: <svg /> },
] as const;

function Harness({ size }: Pick<OptionTilesProps<Shape>, "size">) {
	const [value, setValue] = useState<Shape>("borobildua");
	return (
		<OptionTiles
			name="corners"
			legend="Izkinen markoa"
			items={ITEMS}
			value={value}
			onChange={setValue}
			{...(size === undefined ? {} : { size })}
		/>
	);
}

describe("OptionTiles", () => {
	it("is a radio group named by its legend, with the value checked", () => {
		render(<Harness />);

		const group = screen.getByRole("group", { name: "Izkinen markoa" });
		expect(group).toBeVisible();
		expect(screen.getByRole("radio", { name: "Borobildua" })).toBeChecked();
		expect(screen.getByRole("radio", { name: "Karratua" })).not.toBeChecked();
		expect(screen.getAllByRole("radio")).toHaveLength(3);
	});

	it("hides the icons from assistive tech", () => {
		render(<Harness />);

		expect(screen.getByTestId("ikonoa").closest("[aria-hidden='true']")).not.toBeNull();
	});

	it("changes the choice with the arrow keys", async () => {
		const user = userEvent.setup();
		render(<Harness />);
		await user.click(screen.getByRole("radio", { name: "Borobildua" }));

		await user.keyboard("{ArrowRight}");
		expect(screen.getByRole("radio", { name: "Zirkulua" })).toBeChecked();

		await user.keyboard("{ArrowLeft}{ArrowLeft}");
		expect(screen.getByRole("radio", { name: "Karratua" })).toBeChecked();
	});

	it("calls onChange with the picked value", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn<(value: Shape) => void>();
		render(
			<OptionTiles
				name="corners"
				legend="Izkinen markoa"
				items={ITEMS}
				value="karratua"
				onChange={onChange}
			/>,
		);

		await user.click(screen.getByText("Zirkulua"));

		expect(onChange).toHaveBeenCalledExactlyOnceWith("zirkulua");
	});

	it("keeps the label as the radio's name and a tooltip on small, icon-only tiles", () => {
		render(<Harness size="sm" />);

		const radio = screen.getByRole("radio", { name: "Zirkulua" });
		expect(radio.closest("label")).toHaveAttribute("title", "Zirkulua");
	});
});
