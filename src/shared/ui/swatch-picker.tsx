import { RadioFieldset, type RadioGroupProps, useRadioChange } from "./radio-group";

export interface Swatch<Value extends string> {
	readonly value: Value;
	/** The colour's Basque name ("Morea", "Menda"): what screen readers say. */
	readonly label: string;
	/** Any CSS colour. */
	readonly color: string;
}

export interface SwatchPickerProps<Value extends string> extends RadioGroupProps<Value> {
	readonly items: readonly Swatch<Value>[];
	/** `undefined` when none of the swatches is chosen. */
	readonly value: Value | undefined;
}

const SWATCH =
	"relative block size-[34px] cursor-pointer overflow-hidden rounded-full border-soft border-ink " +
	"has-checked:shadow-[0_0_0_3px_var(--color-surface-raised),0_0_0_5.5px_var(--color-ink)] " +
	"has-focus-visible:outline-focus has-focus-visible:outline-offset-[6px] has-focus-visible:outline-violet";

/**
 * A radio group of round colour swatches, for palette presets. The chosen one gets a white gap
 * and an ink ring, so the choice never shows by colour alone.
 */
export function SwatchPicker<Value extends string>({
	name,
	legend,
	showLegend,
	items,
	value,
	onChange,
	className,
}: SwatchPickerProps<Value>) {
	const handleChange = useRadioChange(items, onChange);
	return (
		<RadioFieldset legend={legend} showLegend={showLegend} className={className}>
			<div className="flex flex-wrap items-center gap-space-3 p-1.5">
				{items.map((item) => (
					<label key={item.value} title={item.label} className={SWATCH}>
						<input
							type="radio"
							name={name}
							value={item.value}
							checked={item.value === value}
							onChange={handleChange}
							className="sr-only"
						/>
						<svg viewBox="0 0 10 10" aria-hidden="true" className="block size-full">
							<circle cx={5} cy={5} r={5} fill={item.color} />
						</svg>
						<span className="sr-only">{item.label}</span>
					</label>
				))}
			</div>
		</RadioFieldset>
	);
}
