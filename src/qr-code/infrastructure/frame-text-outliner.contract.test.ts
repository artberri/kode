import { readFile } from "node:fs/promises";

import { describe, expect, it, vi } from "vitest";

import type { FrameTextOutliner } from "../application/frame-text-outliner";
import type { LabelSlot } from "../domain/qr-frames";
import { BoxFrameTextOutliner } from "./box-frame-text-outliner";
import { OpentypeFrameTextOutliner } from "./opentype-frame-text-outliner";

const FONT_FILE = new URL("../../../public/fonts/unbounded-800-latin.ttf", import.meta.url);

async function fontBytes(): Promise<ArrayBuffer> {
	const bytes = await readFile(FONT_FILE);
	return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
}

const SLOT: LabelSlot = { x: 150, y: 340, maxWidth: 240, fontSize: 30 };

interface Box {
	readonly left: number;
	readonly right: number;
	readonly top: number;
	readonly bottom: number;
}

const COMMAND = /[MLHVQCZmlhvqcz][^MLHVQCZmlhvqcz]*/gu;
const NUMBER = /-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/gu;

/** The box around every point and control point of a path, absolute or relative. */
function boundsOf(d: string): Box {
	const xs: number[] = [];
	const ys: number[] = [];
	let x = 0;
	let y = 0;
	for (const [segment] of d.matchAll(COMMAND)) {
		const command = segment.charAt(0);
		const values = (segment.match(NUMBER) ?? []).map(Number);
		const relative = command === command.toLowerCase();
		const upper = command.toUpperCase();
		const [first = 0] = values;
		if (upper === "H") {
			x = relative ? x + first : first;
		} else if (upper === "V") {
			y = relative ? y + first : first;
		}
		const startX = x;
		const startY = y;
		for (let index = 0; index + 1 < values.length; index += 2) {
			const pointX = (values[index] ?? 0) + (relative ? startX : 0);
			const pointY = (values[index + 1] ?? 0) + (relative ? startY : 0);
			xs.push(pointX);
			ys.push(pointY);
			x = pointX;
			y = pointY;
		}
		xs.push(x);
		ys.push(y);
	}
	return {
		left: Math.min(...xs),
		right: Math.max(...xs),
		top: Math.min(...ys),
		bottom: Math.max(...ys),
	};
}

describe.each([
	{ name: "BoxFrameTextOutliner", create: () => new BoxFrameTextOutliner() },
	{ name: "OpentypeFrameTextOutliner", create: () => new OpentypeFrameTextOutliner(fontBytes) },
])("$name", ({ create }: { create: () => FrameTextOutliner }) => {
	it("draws nothing for blank text", async () => {
		const { outline } = await create().load();

		expect(outline("   ", SLOT)).toBe("");
	});

	it("centres the text on the slot", async () => {
		const { outline } = await create().load();

		const box = boundsOf(outline("Eskaneatu", SLOT));

		expect(box.right).toBeGreaterThan(box.left);
		expect((box.left + box.right) / 2).toBeCloseTo(SLOT.x, -1);
		expect((box.top + box.bottom) / 2).toBeCloseTo(SLOT.y, -1);
		expect(box.bottom - box.top).toBeLessThanOrEqual(SLOT.fontSize);
	});

	it("shrinks a long text to the slot's width", async () => {
		const { outline } = await create().load();

		const box = boundsOf(outline("MMMMMMMMMMMMMMMM", SLOT));

		expect(box.right - box.left).toBeLessThanOrEqual(SLOT.maxWidth * 1.02);
		expect(box.left).toBeGreaterThanOrEqual(SLOT.x - (SLOT.maxWidth / 2) * 1.02);
	});

	it("leaves out the characters it can't draw, and lists each once", async () => {
		const { outline, missing } = await create().load();

		expect(outline("Kaixo🙂🙂", SLOT)).toBe(outline("Kaixo", SLOT));
		expect(missing("Kaixo 🙂 ñ € 🙂")).toEqual(["🙂"]);
		expect(missing("Eskaneatu")).toEqual([]);
	});

	it("draws nothing when it can draw none of the text", async () => {
		const { outline } = await create().load();

		expect(outline("🙂", SLOT)).toBe("");
	});

	it("loads once", async () => {
		const outliner = create();

		expect(await outliner.load()).toBe(await outliner.load());
	});
});

describe("OpentypeFrameTextOutliner", () => {
	it("tries again after the font failed to load", async () => {
		const loadFont = vi
			.fn<() => Promise<ArrayBuffer>>()
			.mockRejectedValueOnce(new Error("offline"))
			.mockImplementation(fontBytes);
		const outliner = new OpentypeFrameTextOutliner(loadFont);

		await expect(outliner.load()).rejects.toThrow("offline");
		const { outline } = await outliner.load();

		expect(outline("Kaixo", SLOT)).not.toBe("");
		expect(loadFont).toHaveBeenCalledTimes(2);
	});
});
