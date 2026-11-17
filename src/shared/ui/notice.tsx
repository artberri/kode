import type { ReactNode } from "react";

import { Icon, type IconName } from "./icon";

export type NoticeTone = "warning" | "success" | "error";

export interface NoticeProps {
	/** `warning` (default) and `success` are announced politely; `error` at once. */
	readonly tone?: NoticeTone;
	/** What happened and what to do, in one or two plain sentences. */
	readonly children: ReactNode;
	/**
	 * Whether it is its own live region (default). A live region added with its text already in
	 * it is often not announced, so for a notice that comes and goes, set `false` and render it
	 * inside a `role="status"` element that is always on the page.
	 */
	readonly live?: boolean;
	readonly className?: string;
}

const TONES: Record<NoticeTone, { readonly icon: IconName; readonly box: string }> = {
	warning: { icon: "warning", box: "border-ink bg-butter" },
	success: { icon: "check", box: "border-ink bg-mint" },
	error: { icon: "error", box: "border-danger bg-surface-raised [&>svg]:text-danger" },
};

/** A bordered message with an icon: a butter warning, a mint success or a danger-bordered error. */
export function Notice({ tone = "warning", children, live = true, className }: NoticeProps) {
	const { icon, box } = TONES[tone];
	const role = tone === "error" ? "alert" : "status";
	return (
		<p
			role={live ? role : undefined}
			className={[
				"m-0 flex items-start gap-2.5 rounded-[18px] border-firm px-3.5 py-3 text-small font-normal text-ink",
				box,
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			<Icon name={icon} size={20} />
			<span>{children}</span>
		</p>
	);
}
