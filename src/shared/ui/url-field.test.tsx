import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { UrlField } from "./url-field";

const LABEL = "Nora eraman behar du zure QRak?";

describe("UrlField", () => {
	it("is a text field named by its visible label", () => {
		render(
			<UrlField
				id="esteka"
				label={LABEL}
				value=""
				onChange={vi.fn<(value: string) => void>()}
			/>,
		);

		expect(screen.getByRole("textbox", { name: LABEL })).toHaveAttribute("inputmode", "url");
	});

	it("hides the https:// chip from assistive tech", () => {
		render(
			<UrlField
				id="esteka"
				label={LABEL}
				value=""
				onChange={vi.fn<(value: string) => void>()}
			/>,
		);

		expect(screen.getByText("https://")).toHaveAttribute("aria-hidden", "true");
		expect(screen.getByRole("textbox", { name: LABEL })).not.toHaveAccessibleName(/https/u);
	});

	it("announces an error, links it to the field and marks the field invalid", () => {
		render(
			<UrlField
				id="esteka"
				label={LABEL}
				value="ftp://x"
				onChange={vi.fn<(value: string) => void>()}
				hint="Itsatsi esteka bat."
				error="Helbide hori ez da baliozkoa."
			/>,
		);

		const field = screen.getByRole("textbox", { name: LABEL });
		expect(screen.getByRole("alert")).toHaveTextContent("Helbide hori ez da baliozkoa.");
		expect(field).toHaveAccessibleDescription("Helbide hori ez da baliozkoa.");
		expect(field).toBeInvalid();
		expect(screen.queryByText("Itsatsi esteka bat.")).not.toBeInTheDocument();
	});

	it("describes the field with a success message over a hint, without an alert", () => {
		render(
			<UrlField
				id="esteka"
				label={LABEL}
				value="kode.eus"
				onChange={vi.fn<(value: string) => void>()}
				hint="Itsatsi esteka bat."
				success="Ondo dago."
			/>,
		);

		const field = screen.getByRole("textbox", { name: LABEL });
		expect(field).toHaveAccessibleDescription("Ondo dago.");
		expect(field).toBeValid();
		expect(screen.queryByRole("alert")).not.toBeInTheDocument();
	});

	it("describes the field with a hint alone", () => {
		render(
			<UrlField
				id="esteka"
				label={LABEL}
				value=""
				onChange={vi.fn<(value: string) => void>()}
				hint="Itsatsi esteka bat."
			/>,
		);

		expect(screen.getByRole("textbox", { name: LABEL })).toHaveAccessibleDescription(
			"Itsatsi esteka bat.",
		);
	});

	it("reports what people type and when they leave the field", async () => {
		const user = userEvent.setup();
		const onChange = vi.fn<(value: string) => void>();
		const onBlur = vi.fn<() => void>();
		render(<UrlField id="esteka" label={LABEL} value="" onChange={onChange} onBlur={onBlur} />);

		await user.type(screen.getByRole("textbox", { name: LABEL }), "k");
		await user.tab();

		expect(onChange).toHaveBeenCalledWith("k");
		expect(onBlur).toHaveBeenCalledOnce();
	});
});
