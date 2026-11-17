import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Logo } from "./logo";

describe("Logo", () => {
	it("links to the home page with the mark and wordmark, named as such", () => {
		render(<Logo href="/" />);

		const link = screen.getByRole("link", { name: "kode, hasiera" });
		expect(link).toHaveAttribute("href", "/");
		expect(link).toHaveTextContent("kode");
	});

	it("shows the mark alone as an image named kode", () => {
		render(<Logo variant="mark" />);

		expect(screen.getByRole("img", { name: "kode" })).toBeVisible();
		expect(screen.queryByText("kode")).not.toBeInTheDocument();
	});

	it("shows the full logo without a link as plain text", () => {
		render(<Logo />);

		expect(screen.queryByRole("link")).not.toBeInTheDocument();
		expect(screen.getByText("kode")).toBeVisible();
	});
});
