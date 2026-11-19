import { RadioFieldset, type RadioGroupProps, useRadioChange } from "./radio-group";

export interface Segment<Value extends string> {
	readonly value: Value;
	/** One short word: "PNG". */
	readonly label: string;
}

export interface SegmentedControlProps<Value extends string> extends RadioGroupProps<Value> {
	readonly items: readonly Segment<Value>[];
	readonly value: Value;
	/** Options that can't be chosen right now; say why in `hint`. */
	readonly disabled?: readonly Value[];
	/** A line under the options that describes the group, such as why an option is disabled. */
	readonly hint?: string | undefined;
	/** Centres the options and the hint, for a control alone in a centred column. */
	readonly centred?: boolean;
}

const NONE: readonly never[] = [];

const SEGMENT =
	"inline-flex min-h-11 cursor-pointer items-center justify-center rounded-pill border-firm border-ink " +
	"bg-surface-raised px-5 font-bold text-ink " +
	"has-checked:bg-ink has-checked:text-on-ink " +
	"has-focus-visible:outline-focus has-focus-visible:outline-offset-2 has-focus-visible:outline-violet " +
	"has-disabled:cursor-not-allowed has-disabled:border-dashed has-disabled:border-line-strong " +
	"has-disabled:bg-surface has-disabled:text-ink-subtle";

/**
 * A radio group of ink-bordered pills for two to four one-word choices; the chosen one fills
 * with ink. The radios are real, so arrow keys move the choice and skip disabled options.
 */
export function SegmentedControl<Value extends string>({
	name,
	legend,
	showLegend,
	items,
	value,
	onChange,
	disabled = NONE,
	hint,
	centred = false,
	className,
}: SegmentedControlProps<Value>) {
	const handleChange = useRadioChange(items, onChange);
	const hintId = `${name}-hint`;
	return (
		<RadioFieldset
			legend={legend}
			showLegend={showLegend}
			describedBy={hint === undefined ? undefined : hintId}
			className={[centred && "text-center", className].filter(Boolean).join(" ")}
		>
			<div className={`flex flex-wrap gap-space-2 ${centred ? "justify-center" : ""}`}>
				{items.map((item) => (
					<label key={item.value} className={SEGMENT}>
						<input
							type="radio"
							name={name}
							value={item.value}
							checked={item.value === value}
							disabled={disabled.includes(item.value)}
							onChange={handleChange}
							className="sr-only"
						/>
						{item.label}
					</label>
				))}
			</div>
			{hint !== undefined && (
				<p id={hintId} className="m-0 mt-space-3 text-small text-ink-muted">
					{hint}
				</p>
			)}
		</RadioFieldset>
	);
}
