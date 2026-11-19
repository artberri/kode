import { Icon } from "./icon";

type Tone = "error" | "success" | "hint";

export interface Message {
	readonly tone: Tone;
	readonly text: string;
}

const MESSAGE_TONE: Record<Tone, string> = {
	error: "font-medium text-danger",
	success: "text-success",
	hint: "text-ink-muted",
};

/** The one message a field shows, in the order error, success, hint. */
export function pickMessage(
	error: string | undefined,
	success: string | undefined,
	hint: string | undefined,
): Message | undefined {
	if (error !== undefined) {
		return { tone: "error", text: error };
	}
	if (success !== undefined) {
		return { tone: "success", text: success };
	}
	return hint === undefined ? undefined : { tone: "hint", text: hint };
}

/** The line under a field: an error is announced and has its icon, a success has a check. */
export function FieldMessage({ id, message }: { readonly id: string; readonly message: Message }) {
	return (
		<p
			id={id}
			role={message.tone === "error" ? "alert" : undefined}
			className={`m-0 flex items-center gap-1.5 text-small ${MESSAGE_TONE[message.tone]}`}
		>
			{message.tone === "error" && <Icon name="error" size={16} />}
			{message.tone === "success" && <Icon name="check" size={16} />}
			{message.text}
		</p>
	);
}
