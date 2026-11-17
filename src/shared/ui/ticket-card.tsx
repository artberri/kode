import type { ReactNode } from "react";

export interface TicketCardProps {
	/** Accessible name of the card's region. */
	readonly label: string;
	/** The main half: the steps that set things up. */
	readonly children: ReactNode;
	/** The peach stub after the tear line: the preview and the download. */
	readonly side?: ReactNode;
	readonly className?: string;
}

/**
 * The generator's card: a main half and a peach stub split by a dashed tear line, side by side
 * from 980px and stacked below. One per page: nothing else uses the perforation.
 */
export function TicketCard({ label, children, side, className }: TicketCardProps) {
	return (
		<section
			aria-label={label}
			className={[
				"flex flex-col overflow-hidden rounded-xl border-firm border-ink bg-surface-raised min-[980px]:flex-row",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			<div className="flex min-w-0 flex-1 flex-col gap-space-7 p-space-8">{children}</div>
			{side !== undefined && (
				<div
					className={
						"flex min-w-0 flex-col gap-space-5 border-t-perforation border-dashed border-ink bg-surface-peach p-space-8 " +
						"min-[980px]:w-[380px] min-[980px]:flex-none min-[980px]:border-t-0 min-[980px]:border-l-perforation"
					}
				>
					{side}
				</div>
			)}
		</section>
	);
}
