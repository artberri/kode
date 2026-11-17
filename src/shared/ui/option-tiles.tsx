import { type ChangeEvent, type ReactNode, useCallback } from "react";

export interface OptionTile<Value extends string> {
	readonly value: Value;
	readonly label: string;
	/** A 36–40px drawing in ink (`currentColor`); hidden from assistive tech. */
	readonly icon: ReactNode;
}

export interface OptionTilesProps<Value extends string> {
	/** The radios' `name`, unique on the page. */
	readonly name: string;
	/** The group's accessible name. */
	readonly legend: string;
	/** Shows the legend as a caption above the tiles; it is visually hidden by default. */
	readonly showLegend?: boolean;
	readonly items: readonly OptionTile<Value>[];
	readonly value: Value;
	readonly onChange: (value: Value) => void;
	/** `md`: 100px tiles with the label under the icon. `sm`: 64px, icon only, label as tooltip. */
	readonly size?: "md" | "sm";
	readonly className?: string;
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

const LEGEND = {
	hidden: "sr-only",
	shown: "mb-space-3 p-0 text-small font-semibold text-ink-muted",
};

/**
 * A radio group drawn as rounded tiles with an icon; the checked tile turns butter. The radios
 * are real, so arrow keys move the choice and the form value is the checked `value`.
 */
export function OptionTiles<Value extends string>({
	name,
	legend,
	showLegend = false,
	items,
	value,
	onChange,
	size = "md",
	className,
}: OptionTilesProps<Value>) {
	const handleChange = useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const picked = items.find((item) => item.value === event.target.value);
			if (picked !== undefined) {
				onChange(picked.value);
			}
		},
		[items, onChange],
	);
	const layout = LAYOUT[size];
	return (
		<fieldset className={["m-0 min-w-0 border-0 p-0", className].filter(Boolean).join(" ")}>
			<legend className={showLegend ? LEGEND.shown : LEGEND.hidden}>{legend}</legend>
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
		</fieldset>
	);
}
