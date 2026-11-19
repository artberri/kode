import { Icon, type IconName } from "./icon";
import { RadioFieldset, type RadioGroupProps, useRadioChange } from "./radio-group";

export interface ChoiceChip<Value extends string> {
	readonly value: Value;
	readonly label: string;
	readonly icon?: IconName;
}

export interface ChoiceChipsProps<Value extends string> extends Omit<
	RadioGroupProps<Value>,
	"showLegend"
> {
	readonly items: readonly ChoiceChip<Value>[];
	readonly value: Value;
	/** Keeps the legend for screen readers only, when a heading right above already names the group. */
	readonly hideLegend?: boolean;
	/** A line under the chips that describes the group. */
	readonly hint?: string | undefined;
}

const CHIP =
	"inline-flex min-h-11 cursor-pointer items-center gap-space-2 rounded-pill border-soft " +
	"border-line-strong bg-surface text-[15px] font-semibold text-ink " +
	"has-checked:border-firm has-checked:border-ink has-checked:bg-butter has-checked:font-bold " +
	"has-focus-visible:outline-focus has-focus-visible:outline-offset-2 has-focus-visible:outline-violet";

/**
 * A radio group drawn as pills, with an optional icon; the checked pill turns butter. The legend
 * shows as a field label. The radios are real, so arrow keys move the choice, and the pills wrap.
 */
export function ChoiceChips<Value extends string>({
	name,
	legend,
	hideLegend = false,
	items,
	value,
	onChange,
	hint,
	className,
}: ChoiceChipsProps<Value>) {
	const handleChange = useRadioChange(items, onChange);
	const hintId = `${name}-laguntza`;
	return (
		<RadioFieldset
			legend={legend}
			showLegend={!hideLegend}
			legendClassName="mb-space-3 p-0 text-label"
			describedBy={hint === undefined ? undefined : hintId}
			className={className}
		>
			<div className="flex flex-wrap gap-space-2">
				{items.map((item) => (
					<label
						key={item.value}
						className={`${CHIP} ${item.icon === undefined ? "px-4" : "pr-4 pl-3"}`}
					>
						<input
							type="radio"
							name={name}
							value={item.value}
							checked={item.value === value}
							onChange={handleChange}
							className="sr-only"
						/>
						{item.icon !== undefined && <Icon name={item.icon} size={20} />}
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
