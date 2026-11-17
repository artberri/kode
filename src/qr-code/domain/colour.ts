/** A colour as `#RRGGBB`, the format colour inputs produce. */
export type HexColor = `#${string}`;

const HEX_COLOR = /^#[0-9a-f]{6}$/iu;

/** Whether text is a `#RRGGBB` colour, in either case. */
export function isHexColor(text: string): text is HexColor {
	return HEX_COLOR.test(text);
}

type Channels = readonly [number, number, number];

function mapChannels(colour: HexColor, map: (channel: number) => number): Channels {
	const value = Number.parseInt(colour.slice(1, 7), 16);
	return [map((value >> 16) & 0xff), map((value >> 8) & 0xff), map(value & 0xff)];
}

function toHex(channel: number): string {
	return Math.round(channel).toString(16).padStart(2, "0").toUpperCase();
}

/** WCAG 2 relative luminance, from 0 (black) to 1 (white). */
export function relativeLuminance(colour: HexColor): number {
	const [r, g, b] = mapChannels(colour, (channel) => {
		const c = channel / 255;
		return c <= 0.040_45 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Mixes a colour towards white: 0 keeps it, 1 gives white. */
export function tint(colour: HexColor, amount: number): HexColor {
	const [r, g, b] = mapChannels(colour, (c) => c + (255 - c) * amount);
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
