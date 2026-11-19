import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";

import { TabPanel, Tabs } from "./tabs";

type Id = "frame" | "shape" | "colours";

const ITEMS = [
	{ id: "frame", label: "Markoa" },
	{ id: "shape", label: "Forma" },
	{ id: "colours", label: "Koloreak" },
] as const;

function Harness({ initial = "frame" }: { readonly initial?: Id }) {
	const [value, setValue] = useState<Id>(initial);
	return (
		<>
			<Tabs items={ITEMS} value={value} onChange={setValue} label="Diseinua" idPrefix="d" />
			{ITEMS.map((item) => (
				<TabPanel key={item.id} id={item.id} idPrefix="d" selected={value === item.id}>
					{`${item.label} panela`}
				</TabPanel>
			))}
		</>
	);
}

function setup(initial?: Id): { user: ReturnType<typeof userEvent.setup> } {
	const user = userEvent.setup();
	render(initial === undefined ? <Harness /> : <Harness initial={initial} />);
	return { user };
}

describe("Tabs", () => {
	it("is a named tab list with the selected tab's panel showing", () => {
		setup();

		expect(screen.getByRole("tablist", { name: "Diseinua" })).toBeVisible();
		expect(screen.getByRole("tab", { name: "Markoa" })).toHaveAttribute(
			"aria-selected",
			"true",
		);
		expect(screen.getByRole("tabpanel", { name: "Markoa" })).toHaveTextContent("Markoa panela");
		expect(screen.getAllByRole("tabpanel")).toHaveLength(1);
	});

	it("controls a panel named by each tab", () => {
		setup();

		const tabs = screen.getAllByRole("tab");
		const panels = screen.getAllByRole("tabpanel", { hidden: true });

		expect(tabs.map((tab) => tab.getAttribute("aria-controls"))).toEqual(
			panels.map((panel) => panel.id),
		);
		expect(panels.map((panel) => panel.getAttribute("aria-labelledby"))).toEqual(
			tabs.map((tab) => tab.id),
		);
	});

	it("keeps only the selected tab in the tab order", async () => {
		const { user } = setup("shape");

		await user.tab();

		expect(screen.getByRole("tab", { name: "Forma" })).toHaveFocus();
		expect(screen.getByRole("tab", { name: "Markoa" })).toHaveAttribute("tabindex", "-1");
		expect(screen.getByRole("tab", { name: "Koloreak" })).toHaveAttribute("tabindex", "-1");
	});

	it("moves and selects with the arrow keys, wrapping at the ends", async () => {
		const { user } = setup();
		await user.tab();

		await user.keyboard("{ArrowRight}");
		expect(screen.getByRole("tab", { name: "Forma", selected: true })).toHaveFocus();
		expect(screen.getByRole("tabpanel", { name: "Forma" })).toBeVisible();

		await user.keyboard("{ArrowLeft}{ArrowLeft}");
		expect(screen.getByRole("tab", { name: "Koloreak", selected: true })).toHaveFocus();
	});

	it("jumps to the first and last tab with Home and End", async () => {
		const { user } = setup("shape");
		await user.tab();

		await user.keyboard("{End}");
		expect(screen.getByRole("tab", { name: "Koloreak", selected: true })).toHaveFocus();

		await user.keyboard("{Home}");
		expect(screen.getByRole("tab", { name: "Markoa", selected: true })).toHaveFocus();
	});

	it("selects a tab on click", async () => {
		const { user } = setup();

		await user.click(screen.getByRole("tab", { name: "Koloreak" }));

		expect(screen.getByRole("tabpanel", { name: "Koloreak" })).toBeVisible();
		expect(screen.queryByText("Markoa panela")).not.toBeVisible();
	});
});
