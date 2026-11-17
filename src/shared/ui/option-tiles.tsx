import type { ReactNode } from "react";

import { RadioFieldset, type RadioGroupProps, useRadioChange } from "./radio-group";

export interface OptionTile<Value extends string> {
	readonly value: Value;
	readonly label: string;
	/** A 36–40px drawing in ink (`currentColor`); hidden from assistive tech. */
	readonly icon: ReactNode;
}

export interface OptionTilesProps<Value extends string> extends RadioGroupProps<Value> {
	readonly items: readonly OptionTile<Value>[];
	readonly value: Value;
	/** `md`: 100px tiles with the label under the icon. `sm`: 64px, icon only, label as tooltip. */
	readonly size?: "md" | "sm";
}

const TILE =
	"relative flex cursor-pointer flex-col items-center justify-center gap-space-2 rounded-md " +
	"border-soft border-line-strong bg-surface text-caption text-ink " +
	"has-checked:border-firm has-checked:border-ink has-checked:bg-butter has-checked:font-bold " +
	"has-focus-visible:outline-focus has-focus-visible:outline-offset-2 has-focus-visible:outline-violet";

const LAYOUT = {
	md: { group: "grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))]", tile: "h-[100px]" },
	sm: { group: "flex flex-wrap", tile: "size-16" },
} as const;

/**
 * A radio group drawn as rounded tiles with an icon; the checked tile turns butter. The radios
 * are real, so arrow keys move the choice and the form value is the checked `value`.
 */
export function OptionTiles<Value extends string>({
	name,
	legend,
	showLegend,
	items,
	value,
	onChange,
	size = "md",
	className,
}: OptionTilesProps<Value>) {
	const handleChange = useRadioChange(items, onChange);
	const layout = LAYOUT[size];
	return (
		<RadioFieldset legend={legend} showLegend={showLegend} className={className}>
			<div className={`${layout.group} gap-space-3`}>
				{items.map((item) => (
					<label
						key={item.value}
						title={size === "sm" ? item.label : undefined}
						className={`${TILE} ${layout.tile}`}
					>
						<input
							type="radio"
							name={name}
							value={item.value}
							checked={item.value === value}
							onChange={handleChange}
							className="sr-only"
						/>
						<span aria-hidden="true" className="contents">
							{item.icon}
						</span>
						<span className={size === "sm" ? "sr-only" : undefined}>{item.label}</span>
					</label>
				))}
			</div>
		</RadioFieldset>
	);
}
