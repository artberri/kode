import type { HexColor } from "./colour";

export type FrameStyle = "none" | "label" | "stamp" | "clipboard" | "ticket";
export type DotStyle = "square" | "round" | "smooth" | "diamond";
export type CornerStyle = "square" | "rounded" | "circle";

export interface QrColours {
	readonly qr: HexColor;
	readonly background: HexColor;
	readonly frame: HexColor;
	readonly frameText: HexColor;
}

/** Everything people can choose about how their QR code looks. */
export interface QrDesign {
	readonly frame: FrameStyle;
	readonly dots: DotStyle;
	/** The outer ring of the three finder patterns. */
	readonly corner: CornerStyle;
	/** The solid centre of the three finder patterns. */
	readonly centre: CornerStyle;
	readonly colours: QrColours;
	readonly frameText: string;
}

export const MAX_FRAME_TEXT_LENGTH = 16;

/** The design the generator opens with: the A2 sticker in the KODE colours. */
export const DEFAULT_DESIGN: QrDesign = {
	frame: "stamp",
	dots: "round",
	corner: "circle",
	centre: "circle",
	colours: { qr: "#2A1740", background: "#FFFFFF", frame: "#6B3FA8", frameText: "#FFFFFF" },
	frameText: "Eskaneatu",
};
