import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Notice } from "./notice";

describe("Notice", () => {
	it("announces a warning politely, as a status", () => {
		render(<Notice>Kontraste txikia.</Notice>);

		expect(screen.getByRole("status")).toHaveTextContent("Kontraste txikia.");
	});

	it("announces a success politely, as a status", () => {
		render(<Notice tone="success">Prest!</Notice>);

		expect(screen.getByRole("status")).toHaveTextContent("Prest!");
	});

	it("announces an error at once, as an alert", () => {
		render(<Notice tone="error">Ezin izan dugu irudia sortu.</Notice>);

		expect(screen.getByRole("alert")).toHaveTextContent("Ezin izan dugu irudia sortu.");
		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});

	it("leaves the announcing to a live region around it when it isn't live", () => {
		render(<Notice live={false}>Kontraste txikia.</Notice>);

		expect(screen.getByText("Kontraste txikia.")).toBeVisible();
		expect(screen.queryByRole("status")).not.toBeInTheDocument();
	});
});
