import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Button } from "./button";

describe("Button", () => {
	it("is a button that acts on click", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn<() => void>();
		render(
			<Button icon="download" onClick={onClick}>
				Deskargatu PNG
			</Button>,
		);

		await user.click(screen.getByRole("button", { name: "Deskargatu PNG" }));

		expect(onClick).toHaveBeenCalledOnce();
		expect(screen.getByRole("button")).toHaveAttribute("type", "button");
	});

	it("can't be clicked while disabled", async () => {
		const user = userEvent.setup();
		const onClick = vi.fn<() => void>();
		render(
			<Button disabled onClick={onClick}>
				Deskargatu PNG
			</Button>,
		);

		await user.click(screen.getByRole("button", { name: "Deskargatu PNG" }));

		expect(screen.getByRole("button")).toBeDisabled();
		expect(onClick).not.toHaveBeenCalled();
	});

	it("is a link with href", () => {
		render(<Button href="#sortzailea">Hasi orain</Button>);

		expect(screen.getByRole("link", { name: "Hasi orain" })).toHaveAttribute(
			"href",
			"#sortzailea",
		);
		expect(screen.queryByRole("button")).not.toBeInTheDocument();
	});
});
