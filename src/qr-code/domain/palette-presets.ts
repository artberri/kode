import type { QrColours } from "./qr-design";

export type PalettePresetId = "morea" | "lila" | "menda" | "mertxikia" | "gurina" | "gaua";

export interface PalettePreset {
	readonly id: PalettePresetId;
	/** The colour's Basque name, as people see it. */
	readonly name: string;
	readonly colours: QrColours;
}

const INK = "#2A1740";
const WHITE = "#FFFFFF";

/**
 * The design system's six palettes, named for the frame colour. Every one keeps the code in ink
 * on white, so it always scans; text on a pastel frame is ink, never white.
 */
export const PALETTE_PRESETS: readonly PalettePreset[] = [
	{
		id: "morea",
		name: "Morea",
		colours: { qr: INK, background: WHITE, frame: "#6B3FA8", frameText: WHITE },
	},
	{
		id: "lila",
		name: "Lila",
		colours: { qr: INK, background: WHITE, frame: "#CDB8FF", frameText: INK },
	},
	{
		id: "menda",
		name: "Menda",
		colours: { qr: INK, background: WHITE, frame: "#8EE6C9", frameText: INK },
	},
	{
		id: "mertxikia",
		name: "Mertxikia",
		colours: { qr: INK, background: WHITE, frame: "#FFC2A1", frameText: INK },
	},
	{
		id: "gurina",
		name: "Gurina",
		colours: { qr: INK, background: WHITE, frame: "#FFE58F", frameText: INK },
	},
	{
		id: "gaua",
		name: "Gaua",
		colours: { qr: INK, background: WHITE, frame: INK, frameText: "#FFE58F" },
	},
];

const KEYS = ["qr", "background", "frame", "frameText"] as const;

/** The preset with exactly these four colours, whatever the case of their hex digits. */
export function presetMatching(colours: QrColours): PalettePresetId | undefined {
	return PALETTE_PRESETS.find((preset) =>
		KEYS.every((key) => preset.colours[key].toUpperCase() === colours[key].toUpperCase()),
	)?.id;
}
