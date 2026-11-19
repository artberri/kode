import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { TextArea, type TextAreaProps } from "./text-area";

const LABEL = "Zure testua";
const HINT = "Testua bera gordetzen da QRan: ez du ezer irekitzen.";

function Harness(props: Partial<Omit<TextAreaProps, "value" | "onChange">>) {
	const [value, setValue] = useState("Kaixo");
	return <TextArea id="testua" label={LABEL} value={value} onChange={setValue} {...props} />;
}

describe("TextArea", () => {
	it("is a multi-line field named by its visible label, four rows tall", () => {
		render(<Harness />);

		const field = screen.getByRole("textbox", { name: LABEL });
		expect(field.tagName).toBe("TEXTAREA");
		expect(field).toHaveValue("Kaixo");
		expect(field).toHaveAttribute("rows", "4");
	});

	it("marks an optional field in its label", () => {
		render(<Harness optional />);

		expect(screen.getByRole("textbox", { name: `${LABEL} (aukerakoa)` })).toBeVisible();
	});

	it("passes the typed text, line breaks included, to onChange", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn<(value: string) => void>();
		render(<TextArea id="testua" label={LABEL} value="" onChange={onChange} />);

		await user.type(screen.getByRole("textbox", { name: LABEL }), "{Enter}");

		expect(onChange).toHaveBeenCalledExactlyOnceWith("\n");
	});

	it("counts the characters beside the hint, which alone describes the field", () => {
		render(<Harness maxLength={500} hint={HINT} />);

		expect(screen.getByText("5/500")).toBeVisible();
		expect(screen.getByRole("textbox", { name: LABEL })).toHaveAccessibleDescription(HINT);
	});

	it("stops at maxLength", async () => {
		const user = userEvent.setup();
		render(<Harness maxLength={8} />);

		await user.type(screen.getByRole("textbox", { name: LABEL }), " mundua");

		expect(screen.getByRole("textbox", { name: LABEL })).toHaveValue("Kaixo mu");
		expect(screen.getByText("8/8")).toBeVisible();
	});

	it("has no counter without maxLength", () => {
		render(<Harness hint={HINT} />);

		expect(screen.queryByText(/\/\d+$/u)).not.toBeInTheDocument();
	});

	it("announces an error in place of the hint and marks the field invalid", () => {
		render(<Harness maxLength={500} hint={HINT} error="Testu luzeegia QR baterako." />);

		const field = screen.getByRole("textbox", { name: LABEL });
		expect(screen.getByRole("alert")).toHaveTextContent("Testu luzeegia QR baterako.");
		expect(field).toBeInvalid();
		expect(field).toHaveAccessibleDescription("Testu luzeegia QR baterako.");
		expect(screen.queryByText(HINT)).not.toBeInTheDocument();
		expect(screen.getByText("5/500")).toBeVisible();
	});
});
