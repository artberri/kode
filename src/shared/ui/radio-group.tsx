import { type ChangeEvent, type ReactNode, useCallback } from "react";

/** What every radio group (`OptionTiles`, `SwatchPicker`) takes besides its items. */
export interface RadioGroupProps<Value extends string> {
	/** The radios' `name`, unique on the page. */
	readonly name: string;
	/** The group's accessible name. */
	readonly legend: string;
	/** Shows the legend as a caption above the options; it is visually hidden by default. */
	readonly showLegend?: boolean;
	readonly onChange: (value: Value) => void;
	readonly className?: string;
}

/** A change handler that passes on the picked item's value, typed as the items' values. */
export function useRadioChange<Value extends string>(
	items: readonly { readonly value: Value }[],
	onChange: (value: Value) => void,
): (event: ChangeEvent<HTMLInputElement>) => void {
	return useCallback(
		(event: ChangeEvent<HTMLInputElement>) => {
			const picked = items.find((item) => item.value === event.target.value);
			if (picked !== undefined) {
				onChange(picked.value);
			}
		},
		[items, onChange],
	);
}

/** The fieldset and legend around a group's options. */
export function RadioFieldset({
	legend,
	showLegend = false,
	legendClassName = "mb-space-3 p-0 text-small font-semibold text-ink-muted",
	describedBy,
	className,
	children,
}: {
	readonly legend: string;
	readonly showLegend?: boolean | undefined;
	/** How the legend looks when shown; a caption by default. */
	readonly legendClassName?: string;
	/** The id of the text that describes the whole group. */
	readonly describedBy?: string | undefined;
	readonly className?: string | undefined;
	readonly children: ReactNode;
}) {
	return (
		<fieldset
			aria-describedby={describedBy}
			className={["m-0 min-w-0 border-0 p-0", className].filter(Boolean).join(" ")}
		>
			<legend className={showLegend ? legendClassName : "sr-only"}>{legend}</legend>
			{children}
		</fieldset>
	);
}
