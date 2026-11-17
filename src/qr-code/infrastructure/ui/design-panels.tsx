import { useCallback } from "react";

import { OptionTiles } from "@/shared/ui/option-tiles";
import { TextField } from "@/shared/ui/text-field";

import { MAX_FRAME_TEXT_LENGTH, type QrDesign } from "../../domain/qr-design";
import { CENTRE_TILES, CORNER_TILES, DOT_TILES, FRAME_TILES } from "./design-tiles";

/** Sets one part of the design. */
export type DesignChange = <Key extends keyof QrDesign>(key: Key, value: QrDesign[Key]) => void;

export interface PanelProps {
	readonly design: QrDesign;
	readonly onChange: DesignChange;
}

/** A stable handler that sets one part of the design. */
export function usePick<Key extends keyof QrDesign>(
	onChange: DesignChange,
	key: Key,
): (value: QrDesign[Key]) => void {
	return useCallback(
		(value: QrDesign[Key]) => {
			onChange(key, value);
		},
		[onChange, key],
	);
}

const TEXT_LIMIT = `Gehienez ${String(MAX_FRAME_TEXT_LENGTH)} karaktere.`;

/** "Markoa": the frame, and the text on it, which needs a frame. */
export function FramePanel({ design, onChange }: PanelProps) {
	const pickFrame = usePick(onChange, "frame");
	const changeText = usePick(onChange, "frameText");
	// Disabled rather than hidden without a frame, so the page doesn't jump.
	const hasFrame = design.frame !== "none";
	return (
		<div className="flex flex-col gap-space-6">
			<OptionTiles
				name="markoa"
				legend="Markoa"
				items={FRAME_TILES}
				value={design.frame}
				onChange={pickFrame}
			/>
			<TextField
				id="markoaren-testua"
				label="Markoaren testua"
				value={design.frameText}
				onChange={changeText}
				placeholder="Eskaneatu"
				maxLength={MAX_FRAME_TEXT_LENGTH}
				disabled={!hasFrame}
				hint={hasFrame ? TEXT_LIMIT : "Markorik gabe, ez dago testurik."}
				className="max-w-[420px]"
			/>
		</div>
	);
}

/** "Forma": the dots, and the ring and centre of the three corner patterns. */
export function ShapePanel({ design, onChange }: PanelProps) {
	const pickDots = usePick(onChange, "dots");
	const pickCorner = usePick(onChange, "corner");
	const pickCentre = usePick(onChange, "centre");
	return (
		<div className="flex flex-col gap-space-6">
			<OptionTiles
				name="puntuak"
				legend="Puntuen forma"
				showLegend
				items={DOT_TILES}
				value={design.dots}
				onChange={pickDots}
			/>
			<div className="flex flex-wrap gap-x-space-7 gap-y-space-6">
				<OptionTiles
					name="izkinak"
					legend="Izkinen markoa"
					showLegend
					size="sm"
					items={CORNER_TILES}
					value={design.corner}
					onChange={pickCorner}
				/>
				<OptionTiles
					name="erdiguneak"
					legend="Izkinen erdigunea"
					showLegend
					size="sm"
					items={CENTRE_TILES}
					value={design.centre}
					onChange={pickCentre}
				/>
			</div>
		</div>
	);
}
