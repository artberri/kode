import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { TextField } from "./text-field";

const LABEL = "Markoaren testua";

function Harness({ maxLength }: { readonly maxLength?: number }) {
	const [value, setValue] = useState("Kaixo");
	return (
		<TextField
			id="testua"
			label={LABEL}
			value={value}
			onChange={setValue}
			placeholder="Eskaneatu"
			{...(maxLength === undefined ? {} : { maxLength })}
		/>
	);
}

describe("TextField", () => {
	it("is a text field named by its visible label, with an example placeholder", () => {
		render(<Harness />);

		const field = screen.getByRole("textbox", { name: LABEL });
		expect(field).toHaveValue("Kaixo");
		expect(field).toHaveAttribute("placeholder", "Eskaneatu");
	});

	it("passes the typed text to onChange", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn<(value: string) => void>();
		render(<TextField id="testua" label={LABEL} value="" onChange={onChange} />);

		await user.type(screen.getByRole("textbox", { name: LABEL }), "M");

		expect(onChange).toHaveBeenCalledExactlyOnceWith("M");
	});

	it("counts the characters against maxLength", () => {
		render(<Harness maxLength={16} />);

		expect(screen.getByText("5/16")).toBeVisible();
	});

	it("stops at maxLength", async () => {
		const user = userEvent.setup();
		render(<Harness maxLength={8} />);

		await user.type(screen.getByRole("textbox", { name: LABEL }), " mundua");

		expect(screen.getByRole("textbox", { name: LABEL })).toHaveValue("Kaixo mu");
		expect(screen.getByText("8/8")).toBeVisible();
	});

	it("has no counter without maxLength", () => {
		render(<Harness />);

		expect(screen.queryByText(/\/\d+$/u)).not.toBeInTheDocument();
	});

	it("describes the field with its hint", () => {
		render(
			<TextField
				id="testua"
				label={LABEL}
				value=""
				onChange={vi.fn<(value: string) => void>()}
				hint="Markoaren behealdean agertzen da."
			/>,
		);

		expect(screen.getByRole("textbox", { name: LABEL })).toHaveAccessibleDescription(
			"Markoaren behealdean agertzen da.",
		);
	});

	it("can be disabled, keeping its text, with a hint that says why", () => {
		render(
			<TextField
				id="testua"
				label={LABEL}
				value="Eskaneatu"
				onChange={vi.fn<(value: string) => void>()}
				disabled
				hint="Markorik gabe, ez dago testurik."
			/>,
		);

		const field = screen.getByRole("textbox", { name: LABEL });
		expect(field).toBeDisabled();
		expect(field).toHaveValue("Eskaneatu");
		expect(field).toHaveAccessibleDescription("Markorik gabe, ez dago testurik.");
	});
});
