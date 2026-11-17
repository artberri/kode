import type { OptionTile } from "@/shared/ui/option-tiles";

import type { CornerStyle, DotStyle, FrameStyle } from "../../domain/qr-design";
import { dotsPath, finderCentrePath, finderRingPath } from "../../domain/qr-shapes";

// The drawings are in ink (`currentColor`) on the tile, with white for the frames' paper.
const PAPER = "fill-surface-raised stroke-current";

function FrameIcon({ children }: { readonly children: React.ReactNode }) {
	return (
		<svg viewBox="0 0 40 44" width="36" height="40" fill="currentColor">
			{children}
		</svg>
	);
}

/** The five frames, drawn as the A2 tiles. */
export const FRAME_TILES: readonly OptionTile<FrameStyle>[] = [
	{
		value: "none",
		label: "Markorik ez",
		icon: (
			<FrameIcon>
				<g fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round">
					<circle cx={20} cy={22} r={14} />
					<path d="M10 32 L30 12" />
				</g>
			</FrameIcon>
		),
	},
	{
		value: "label",
		label: "Etiketa",
		icon: (
			<FrameIcon>
				<rect x={6} y={3} width={28} height={38} rx={5} />
				<rect x={9} y={6} width={22} height={22} rx={3} className="fill-surface-raised" />
				<rect x={13} y={10} width={14} height={14} rx={1.5} />
			</FrameIcon>
		),
	},
	{
		value: "stamp",
		label: "Zigilua",
		icon: (
			<FrameIcon>
				<rect
					x={6}
					y={3}
					width={28}
					height={38}
					rx={6}
					strokeWidth={2.4}
					className={PAPER}
				/>
				<path d="M6 31 H34" stroke="currentColor" strokeWidth={2.4} strokeDasharray="3 3" />
				<rect x={13} y={9} width={14} height={14} rx={1.5} />
			</FrameIcon>
		),
	},
	{
		value: "clipboard",
		label: "Arbela",
		icon: (
			<FrameIcon>
				<rect
					x={6.2}
					y={7.2}
					width={27.6}
					height={34.6}
					rx={3.5}
					strokeWidth={2.4}
					className={PAPER}
				/>
				<rect x={14} y={4} width={12} height={6} rx={3} />
				<rect x={13} y={14} width={14} height={14} rx={1.5} />
			</FrameIcon>
		),
	},
	{
		value: "ticket",
		label: "Tiketa",
		icon: (
			<FrameIcon>
				<path
					d="M8 4 H32 V40 L28 37 L24 40 L20 37 L16 40 L12 37 L8 40 Z"
					strokeWidth={2.2}
					strokeLinejoin="round"
					className={PAPER}
				/>
				<rect x={13} y={10} width={14} height={14} rx={1.5} />
			</FrameIcon>
		),
	},
];

/** A 5×5 patch of modules, enough to show how the dots join up. */
const SAMPLE = [
	[1, 1, 0, 1, 1],
	[1, 0, 1, 1, 0],
	[0, 1, 1, 0, 1],
	[1, 1, 0, 0, 1],
	[1, 0, 1, 1, 1],
].map((row) => row.map((cell) => cell === 1));

function dotIcon(style: DotStyle) {
	return (
		<svg viewBox="-0.6 -0.6 6.2 6.2" width="38" height="38" fill="currentColor">
			<path d={dotsPath(SAMPLE, style, { skipFinders: false })} />
		</svg>
	);
}

export const DOT_TILES: readonly OptionTile<DotStyle>[] = [
	{ value: "square", label: "Karratuak", icon: dotIcon("square") },
	{ value: "round", label: "Puntuak", icon: dotIcon("round") },
	{ value: "smooth", label: "Leunak", icon: dotIcon("smooth") },
	{ value: "diamond", label: "Diamanteak", icon: dotIcon("diamond") },
];

const SHAPE_LABELS: Record<CornerStyle, string> = {
	square: "Karratua",
	rounded: "Borobildua",
	circle: "Zirkulua",
};

const SHAPES: readonly CornerStyle[] = ["square", "rounded", "circle"];

function FinderIcon({ children }: { readonly children: React.ReactNode }) {
	return (
		<svg viewBox="-0.8 -0.8 8.6 8.6" width="34" height="34" fill="currentColor">
			{children}
		</svg>
	);
}

/** Each corner frame shape, around a square centre. */
export const CORNER_TILES: readonly OptionTile<CornerStyle>[] = SHAPES.map((shape) => ({
	value: shape,
	label: SHAPE_LABELS[shape],
	icon: (
		<FinderIcon>
			<path d={finderRingPath(0, 0, shape) + finderCentrePath(0, 0, "square")} />
		</FinderIcon>
	),
}));

/** Each corner centre shape, inside a faint square ring. */
export const CENTRE_TILES: readonly OptionTile<CornerStyle>[] = SHAPES.map((shape) => ({
	value: shape,
	label: SHAPE_LABELS[shape],
	icon: (
		<FinderIcon>
			<path d={finderRingPath(0, 0, "square")} className="fill-line-strong opacity-40" />
			<path d={finderCentrePath(0, 0, shape)} />
		</FinderIcon>
	),
}));
