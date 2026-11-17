import { useCallback } from "react";

import { ColorField } from "@/shared/ui/color-field";
import { Notice } from "@/shared/ui/notice";
import { SwatchPicker } from "@/shared/ui/swatch-picker";

import { isHexColor } from "../../domain/colour";
import { type Contrast, contrastOf } from "../../domain/contrast";
import {
	PALETTE_PRESETS,
	type PalettePresetId,
	presetMatching,
} from "../../domain/palette-presets";
import type { QrColours } from "../../domain/qr-design";
import { type PanelProps, usePick } from "./design-panels";

/** Each preset shows as its frame colour. */
const SWATCHES = PALETTE_PRESETS.map((preset) => ({
	value: preset.id,
	label: preset.name,
	color: preset.colours.frame,
}));

const FIELDS: readonly {
	readonly part: keyof QrColours;
	readonly label: string;
	/** Only drawn on a frame. */
	readonly needsFrame: boolean;
}[] = [
	{ part: "qr", label: "QRaren kolorea", needsFrame: false },
	{ part: "background", label: "Hondoaren kolorea", needsFrame: false },
	{ part: "frame", label: "Markoaren kolorea", needsFrame: true },
	{ part: "frameText", label: "Testuaren kolorea", needsFrame: true },
];

const WARNINGS: Record<Exclude<Contrast, "ok">, string> = {
	low: "Kontraste txikia: baliteke mugikor batzuek QRa ez irakurtzea. Erabili kolore ilunagoa hondo argiaren gainean.",
	inverted:
		"Kolore argia hondo ilunaren gainean: kamera askok hobeto irakurtzen dute iluna argiaren gainean.",
};

function ColourInput({
	part,
	label,
	colours,
	onChange,
	disabled,
}: {
	readonly part: keyof QrColours;
	readonly label: string;
	readonly colours: QrColours;
	readonly onChange: (colours: QrColours) => void;
	readonly disabled: boolean;
}) {
	const change = useCallback(
		(value: string) => {
			if (isHexColor(value)) {
				onChange({ ...colours, [part]: value });
			}
		},
		[colours, part, onChange],
	);
	return (
		<ColorField
			id={`kolorea-${part}`}
			label={label}
			value={colours[part]}
			onChange={change}
			disabled={disabled}
		/>
	);
}

/** "Koloreak": a palette preset, any of the four colours, and a warning when the code is hard to scan. */
export function ColourPanel({ design, onChange }: PanelProps) {
	const { colours } = design;
	const setColours = usePick(onChange, "colours");
	const pickPreset = useCallback(
		(id: PalettePresetId) => {
			const preset = PALETTE_PRESETS.find((candidate) => candidate.id === id);
			if (preset !== undefined) {
				setColours(preset.colours);
			}
		},
		[setColours],
	);
	const contrast = contrastOf(colours.qr, colours.background);
	const hasFrame = design.frame !== "none";
	return (
		<div className="flex flex-col gap-space-6">
			<SwatchPicker
				name="paleta"
				legend="Paleta"
				showLegend
				items={SWATCHES}
				value={presetMatching(colours)}
				onChange={pickPreset}
			/>
			<div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-space-3">
				{FIELDS.map((field) => (
					<ColourInput
						key={field.part}
						part={field.part}
						label={field.label}
						colours={colours}
						onChange={setColours}
						disabled={field.needsFrame && !hasFrame}
					/>
				))}
			</div>
			{!hasFrame && (
				<p className="m-0 -mt-space-3 text-small text-ink-muted">
					Markorik gabe, markoaren eta testuaren koloreak ez dira erabiltzen.
				</p>
			)}
			{contrast !== "ok" && <Notice>{WARNINGS[contrast]}</Notice>}
		</div>
	);
}
