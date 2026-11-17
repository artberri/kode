import { type ChangeEvent, useCallback } from "react";

export interface ColorFieldProps {
	readonly id: string;
	readonly label: string;
	/** `#rrggbb`, in either case. */
	readonly value: string;
	/** Called with the picked colour, as `#rrggbb` in lowercase (the browser's format). */
	readonly onChange: (value: string) => void;
	readonly className?: string;
}

const CARD =
	"flex cursor-pointer items-center gap-space-3 rounded-md border-firm border-ink bg-surface-raised " +
	"py-2.5 pr-3.5 pl-2.5 focus-within:outline-focus focus-within:outline-offset-2 focus-within:outline-violet";

const SWATCH =
	"size-11 flex-none cursor-pointer rounded-[14px] border-soft border-ink bg-surface-raised p-0 " +
	"focus-visible:outline-none";

/**
 * A labelled native colour picker that shows the chosen hex value. The whole card opens the
 * browser's picker; the input is named by the label and described by the hex value.
 */
export function ColorField({ id, label, value, onChange, className }: ColorFieldProps) {
	const nameId = `${id}-izena`;
	const hexId = `${id}-hex`;
	const handleChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			onChange(event.target.value);
		},
		[onChange],
	);
	return (
		<label htmlFor={id} className={[CARD, className].filter(Boolean).join(" ")}>
			<input
				id={id}
				type="color"
				value={value}
				onChange={handleChange}
				aria-labelledby={nameId}
				aria-describedby={hexId}
				className={SWATCH}
			/>
			<span className="flex min-w-0 flex-col gap-0.5">
				<span id={nameId} className="text-small font-bold">
					{label}
				</span>
				<span id={hexId} className="font-mono text-code text-ink-muted">
					{value.toUpperCase()}
				</span>
			</span>
		</label>
	);
}
