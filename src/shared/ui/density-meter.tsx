interface DensityLevel {
	/** The most modules a side this level covers. */
	readonly max: number;
	readonly label: string;
	readonly advice: string;
	/** The fill of the segments this level lights. */
	readonly fill: string;
}

// Module counts at error correction Q: up to version 7 (45) reads anywhere, up to version 13 (69)
// wants a bigger print.
const LEVELS = [
	{ max: 45, label: "Arina", advice: "edozein mugikorrek erraz irakurriko du.", fill: "bg-mint" },
	{
		max: 69,
		label: "Ertaina",
		advice: "inprimatu gutxienez 3 cm-ko zabaleran.",
		fill: "bg-butter",
	},
	{
		max: Infinity,
		label: "Trinkoa",
		advice: "laburtu edukia edo inprimatu handiago.",
		fill: "bg-peach",
	},
] as const satisfies readonly DensityLevel[];

const SEGMENTS = [0, 1, 2] as const;

function levelOf(modules: number): number {
	const index = LEVELS.findIndex(({ max }) => modules <= max);
	return index === -1 ? LEVELS.length - 1 : index;
}

export interface DensityMeterProps {
	/** The encoded code's modules a side. */
	readonly modules: number;
	readonly className?: string;
}

/**
 * How dense the QR code is, in words and three segments, so people know when to shorten the
 * content or print bigger. Not a live region: it changes with every keystroke.
 */
export function DensityMeter({ modules, className }: DensityMeterProps) {
	const index = levelOf(modules);
	const level = LEVELS[index] ?? LEVELS[0];
	return (
		<div className={["flex flex-col gap-space-2", className].filter(Boolean).join(" ")}>
			<div className="flex justify-between gap-space-2 text-small">
				<span className="font-bold">Dentsitatea</span>
				<span className="text-ink-muted tabular-nums">{`${modules}×${modules} modulu`}</span>
			</div>
			<div className="flex gap-space-1" aria-hidden="true">
				{SEGMENTS.map((segment) => (
					<span
						key={segment}
						data-filled={segment <= index ? true : undefined}
						className={`h-2.5 flex-1 rounded-pill border-soft border-ink ${segment <= index ? level.fill : "bg-surface-raised"}`}
					/>
				))}
			</div>
			<p className="m-0 text-small text-ink-muted">{`${level.label}: ${level.advice}`}</p>
		</div>
	);
}
