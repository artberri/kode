import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ColorField } from "./color-field";

describe("ColorField", () => {
	it("is a colour input named by its label alone", () => {
		render(
			<ColorField
				id="qr-kolorea"
				label="QRaren kolorea"
				value="#2a1740"
				onChange={vi.fn<(value: string) => void>()}
			/>,
		);

		const input = screen.getByLabelText("QRaren kolorea");
		expect(input).toHaveAttribute("type", "color");
		expect(input).toHaveAccessibleName("QRaren kolorea");
		expect(input).toHaveValue("#2a1740");
	});

	it("shows the hex value in capitals and describes the input with it", () => {
		render(
			<ColorField
				id="qr-kolorea"
				label="QRaren kolorea"
				value="#2a1740"
				onChange={vi.fn<(value: string) => void>()}
			/>,
		);

		expect(screen.getByText("#2A1740")).toBeVisible();
		expect(screen.getByLabelText("QRaren kolorea")).toHaveAccessibleDescription("#2A1740");
	});

	it("passes the picked colour to onChange", () => {
		const onChange = vi.fn<(value: string) => void>();
		render(
			<ColorField
				id="qr-kolorea"
				label="QRaren kolorea"
				value="#2a1740"
				onChange={onChange}
			/>,
		);

		fireEvent.change(screen.getByLabelText("QRaren kolorea"), { target: { value: "#123456" } });

		expect(onChange).toHaveBeenCalledExactlyOnceWith("#123456");
	});

	it("can be disabled", () => {
		render(
			<ColorField
				id="markoa"
				label="Markoaren kolorea"
				value="#6b3fa8"
				onChange={vi.fn<(value: string) => void>()}
				disabled
			/>,
		);

		expect(screen.getByLabelText("Markoaren kolorea")).toBeDisabled();
	});
});
