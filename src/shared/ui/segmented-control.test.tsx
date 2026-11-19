import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { SegmentedControl } from "./segmented-control";

type Format = "png" | "svg" | "webp";

const ITEMS = [
	{ value: "png", label: "PNG" },
	{ value: "svg", label: "SVG" },
	{ value: "webp", label: "WebP" },
] as const;

const WEBP: readonly Format[] = ["webp"];
const NO_WEBP_HINT = "Nabigatzaile honek ezin du WebP sortu.";

function Harness({ webp = true }: { readonly webp?: boolean }) {
	const [value, setValue] = useState<Format>("png");
	return (
		<SegmentedControl
			name="format"
			legend="Formatua"
			items={ITEMS}
			{...(webp ? {} : { disabled: WEBP, hint: NO_WEBP_HINT })}
			value={value}
			onChange={setValue}
		/>
	);
}

describe("SegmentedControl", () => {
	it("is a radio group named by its legend, with the value checked", () => {
		render(<Harness />);

		expect(screen.getByRole("group", { name: "Formatua" })).toBeVisible();
		expect(screen.getAllByRole("radio").map((radio) => radio.getAttribute("value"))).toEqual([
			"png",
			"svg",
			"webp",
		]);
		expect(screen.getByRole("radio", { name: "PNG" })).toBeChecked();
	});

	it("changes the choice with the arrow keys", async () => {
		const user = userEvent.setup();
		render(<Harness />);
		await user.click(screen.getByRole("radio", { name: "PNG" }));

		await user.keyboard("{ArrowRight}");

		expect(screen.getByRole("radio", { name: "SVG" })).toBeChecked();
	});

	it("disables one option and says why", async () => {
		const user = userEvent.setup();
		render(<Harness webp={false} />);

		expect(screen.getByRole("radio", { name: "WebP" })).toBeDisabled();
		expect(screen.getByRole("group", { name: "Formatua" })).toHaveAccessibleDescription(
			"Nabigatzaile honek ezin du WebP sortu.",
		);

		await user.click(screen.getByText("WebP"));
		expect(screen.getByRole("radio", { name: "PNG" })).toBeChecked();
	});
});
