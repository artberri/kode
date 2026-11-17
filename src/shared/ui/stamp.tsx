import type { ReactNode } from "react";

export type StampTone = "mint" | "butter" | "peach";

const TONES: Record<StampTone, string> = {
	mint: "bg-mint",
	butter: "bg-butter",
	peach: "bg-peach",
};

export interface StampProps {
	/** `mint` (default), `butter` or `peach`. */
	readonly tone?: StampTone;
	/** One or two short words that repeat a fact already on the page. */
	readonly children: ReactNode;
	readonly className?: string;
}

/** A round rubber stamp, tilted -14°, with a dashed inner ring: the hero's playful accent. */
export function Stamp({ tone = "mint", children, className }: StampProps) {
	return (
		<span
			className={[
				"relative inline-flex size-[104px] flex-none -rotate-14 items-center justify-center rounded-full border-firm border-ink font-display text-[20px] font-extrabold text-ink",
				TONES[tone],
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			<svg viewBox="0 0 104 104" aria-hidden="true" className="absolute inset-0 size-full">
				<circle
					cx={52}
					cy={52}
					r={40}
					className="fill-none stroke-ink stroke-2 [stroke-dasharray:4_5]"
				/>
			</svg>
			<span className="relative">{children}</span>
		</span>
	);
}
