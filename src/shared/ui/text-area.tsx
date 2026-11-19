import { type ChangeEvent, type ReactNode, useCallback } from "react";

import { FieldMessage, type Message, pickMessage } from "./field-message";

export interface TextAreaProps {
	readonly id: string;
	readonly label: ReactNode;
	readonly value: string;
	readonly onChange: (value: string) => void;
	/** Adds " (aukerakoa)" to the label. Mark the optional fields, never the required ones. */
	readonly optional?: boolean;
	/** What happens with the text, under the field. */
	readonly hint?: string | undefined;
	/** Says what is wrong; turns the border danger and is announced. Wins over `hint`. */
	readonly error?: string | undefined;
	/** Caps the text and shows an "n/max" counter at the end of the message line. */
	readonly maxLength?: number;
	/** Visible rows; people can drag it taller. Default 4. */
	readonly rows?: number;
	/** An example of what to type, never the label. */
	readonly placeholder?: string;
	readonly className?: string;
}

const BOX =
	"block min-h-32 w-full resize-y rounded-md border-firm bg-surface px-[18px] py-3.5 text-lg " +
	"leading-normal text-ink placeholder:text-ink-subtle " +
	"focus-visible:outline-focus focus-visible:outline-offset-2 focus-visible:outline-violet";

/** The message under the field, with the counter at the end of the line. */
function MessageLine({
	id,
	message,
	length,
	maxLength,
}: {
	readonly id: string;
	readonly message: Message | undefined;
	readonly length: number;
	readonly maxLength: number | undefined;
}) {
	if (message === undefined && maxLength === undefined) {
		return null;
	}
	return (
		<div className="flex items-start gap-space-3">
			{message !== undefined && <FieldMessage id={id} message={message} />}
			{maxLength !== undefined && (
				// The field itself stops at maxLength, so the counter is a visual aid only.
				<span
					aria-hidden="true"
					className="ml-auto text-caption font-normal text-ink-subtle tabular-nums"
				>
					{`${String(length)}/${String(maxLength)}`}
				</span>
			)}
		</div>
	);
}

/** A multi-line field with a rounded box, a visible label and, with `maxLength`, a counter. */
export function TextArea({
	id,
	label,
	value,
	onChange,
	optional = false,
	hint,
	error,
	maxLength,
	rows = 4,
	placeholder,
	className,
}: TextAreaProps) {
	const shown = pickMessage(error, undefined, hint);
	const messageId = `${id}-mezua`;
	const invalid = shown?.tone === "error";
	const handleChange = useCallback(
		(event: ChangeEvent<HTMLTextAreaElement>) => {
			onChange(event.target.value);
		},
		[onChange],
	);
	return (
		<div className={["flex flex-col gap-space-3", className].filter(Boolean).join(" ")}>
			<label htmlFor={id} className="text-label">
				{label}
				{optional && (
					<span className="text-small font-medium text-ink-muted"> (aukerakoa)</span>
				)}
			</label>
			<textarea
				id={id}
				rows={rows}
				value={value}
				placeholder={placeholder}
				maxLength={maxLength}
				onChange={handleChange}
				aria-invalid={invalid ? true : undefined}
				aria-describedby={shown === undefined ? undefined : messageId}
				className={`${BOX} ${invalid ? "border-danger" : "border-ink"}`}
			/>
			<MessageLine
				id={messageId}
				message={shown}
				length={value.length}
				maxLength={maxLength}
			/>
		</div>
	);
}
