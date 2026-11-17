export interface StepLabelProps {
	readonly step: number;
	/** The step's one-word name; shown uppercase. */
	readonly children: string;
	readonly id?: string;
	readonly className?: string;
}

/** The numbered eyebrow that opens each step of a flow: "1 · ESTEKA". */
export function StepLabel({ step, children, id, className }: StepLabelProps) {
	return (
		<p
			id={id}
			className={["m-0 font-display text-eyebrow text-violet uppercase", className]
				.filter(Boolean)
				.join(" ")}
		>
			{`${String(step)} · ${children}`}
		</p>
	);
}
