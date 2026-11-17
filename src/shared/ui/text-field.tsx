import { type ChangeEvent, type ReactNode, useCallback } from "react";

export interface TextFieldProps {
	readonly id: string;
	readonly label: ReactNode;
	readonly value: string;
	readonly onChange: (value: string) => void;
	/** An example of what to type, never the label. */
	readonly placeholder?: string;
	/** Caps the text and shows an "n/max" counter. */
	readonly maxLength?: number;
	/** Neutral help under the field; when disabled, say why. */
	readonly hint?: string;
	/** Greys the field out but keeps its text, so the layout doesn't jump. */
	readonly disabled?: boolean;
	readonly className?: string;
}

const BOX =
	"flex items-center gap-space-2 rounded-pill border-firm border-ink bg-surface py-1.5 pr-1.5 pl-3.5 " +
	"focus-within:outline-focus focus-within:outline-offset-2 focus-within:outline-violet " +
	"has-disabled:border-dashed has-disabled:border-line-strong";

/** The input itself stops at `maxLength`, so the counter is a visual aid only. */
function Counter({ length, max }: { readonly length: number; readonly max: number }) {
	return (
		<span
			aria-hidden="true"
			className="pr-3 text-caption font-normal text-ink-subtle tabular-nums"
		>
			{`${String(length)}/${String(max)}`}
		</span>
	);
}

/** A single-line pill input with a visible label and, with `maxLength`, a character counter. */
export function TextField({
	id,
	label,
	value,
	onChange,
	placeholder,
	maxLength,
	hint,
	disabled = false,
	className,
}: TextFieldProps) {
	const hintId = `${id}-laguntza`;
	const handleChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			onChange(event.target.value);
		},
		[onChange],
	);
	return (
		<div className={["flex flex-col gap-space-3", className].filter(Boolean).join(" ")}>
			<label htmlFor={id} className="text-label">
				{label}
			</label>
			<div className={BOX}>
				<input
					id={id}
					type="text"
					value={value}
					placeholder={placeholder}
					maxLength={maxLength}
					onChange={handleChange}
					disabled={disabled}
					aria-describedby={hint === undefined ? undefined : hintId}
					className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-lg text-ink placeholder:text-ink-subtle focus-visible:outline-none disabled:cursor-not-allowed disabled:text-ink-subtle"
				/>
				{maxLength !== undefined && <Counter length={value.length} max={maxLength} />}
			</div>
			{hint !== undefined && (
				<p id={hintId} className="m-0 text-small text-ink-muted">
					{hint}
				</p>
			)}
		</div>
	);
}
