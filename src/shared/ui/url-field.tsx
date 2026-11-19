import { type ChangeEvent, type ReactNode, useCallback } from "react";

import { FieldMessage, pickMessage } from "./field-message";

export interface UrlFieldProps {
	readonly id: string;
	readonly label: ReactNode;
	readonly value: string;
	readonly onChange: (value: string) => void;
	readonly onBlur?: () => void;
	readonly placeholder?: string;
	/** Neutral help. */
	readonly hint?: string;
	/** Confirms what will be used, with a check. Wins over `hint`. */
	readonly success?: string;
	/** Says what is wrong; turns the border danger and is announced. Wins over everything else. */
	readonly error?: string;
	readonly className?: string;
}

const BOX =
	"flex items-center gap-space-2 rounded-pill border-firm bg-surface py-1.5 pr-1.5 pl-2 " +
	"focus-within:outline-focus focus-within:outline-offset-2 focus-within:outline-violet";

// Decoration only: the field accepts links with or without the scheme.
const HTTPS_CHIP = (
	<span
		aria-hidden="true"
		className="flex-none rounded-pill bg-ink px-3.5 py-2 text-small font-bold text-on-ink"
	>
		https://
	</span>
);

/**
 * The pill-shaped link input with an "https://" chip in front. The chip is decoration: people
 * may paste a link with or without the scheme. One message shows: error, success or hint.
 */
export function UrlField({
	id,
	label,
	value,
	onChange,
	onBlur,
	placeholder = "zure-webgunea.eus",
	hint,
	success,
	error,
	className,
}: UrlFieldProps) {
	const shown = pickMessage(error, success, hint);
	const messageId = `${id}-message`;
	const invalid = shown?.tone === "error";
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
			<div className={`${BOX} ${invalid ? "border-danger" : "border-ink"}`}>
				{HTTPS_CHIP}
				<input
					id={id}
					type="text"
					inputMode="url"
					autoComplete="url"
					autoCapitalize="none"
					spellCheck={false}
					value={value}
					placeholder={placeholder}
					onChange={handleChange}
					onBlur={onBlur}
					aria-invalid={invalid ? true : undefined}
					aria-describedby={shown === undefined ? undefined : messageId}
					className="min-w-0 flex-1 bg-transparent px-2 py-2.5 text-lg text-ink placeholder:text-ink-subtle focus-visible:outline-none"
				/>
			</div>
			{shown !== undefined && <FieldMessage id={messageId} message={shown} />}
		</div>
	);
}
