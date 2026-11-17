import type { ReactNode } from "react";

export type TagVariant = "dashed" | "butter";

const VARIANTS: Record<TagVariant, string> = {
	dashed: "border-dashed",
	butter: "border-solid bg-butter",
};

export interface TagProps {
	/** `dashed` ink outline (default) or `butter` fill. */
	readonly variant?: TagVariant;
	/** Short facts separated by " · ": "Doan · konturik gabe · euskaraz". */
	readonly children: ReactNode;
	readonly className?: string;
}

/** A small pill of static text above a headline: never clickable, never a status. */
export function Tag({ variant = "dashed", children, className }: TagProps) {
	return (
		<span
			className={[
				"inline-flex items-center gap-1.5 rounded-pill border-soft border-ink px-space-4 py-space-2 text-small font-bold text-ink",
				VARIANTS[variant],
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			{children}
		</span>
	);
}
