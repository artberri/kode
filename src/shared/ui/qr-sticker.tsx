import type { ReactNode } from "react";

export type QrStickerTone = "butter" | "mint" | "lilac";

const TONES: Record<QrStickerTone, string> = {
	butter: "bg-butter",
	mint: "bg-mint",
	lilac: "bg-lilac",
};

export interface QrStickerProps {
	/** The QR code, as an image named by its link. */
	readonly children: ReactNode;
	/** The call to action on the stub, "Eskaneatu"; no label, no stub. */
	readonly label?: string;
	/** `butter` (default), `mint` or `lilac`. */
	readonly tone?: QrStickerTone;
	/** Rotates the sticker 4°, for the hero. */
	readonly tilt?: boolean;
	/** Sets the width, which the sticker leaves to its container. */
	readonly className?: string;
}

/** The QR code as a white sticker with a dashed tear-off stub. */
export function QrSticker({
	children,
	label,
	tone = "butter",
	tilt = false,
	className,
}: QrStickerProps) {
	return (
		<figure
			className={[
				"m-0 max-w-full overflow-hidden rounded-lg border-firm border-ink bg-surface-raised",
				tilt && "rotate-4",
				className,
			]
				.filter(Boolean)
				.join(" ")}
		>
			<div className="px-[26px] pt-[26px] pb-[18px]">{children}</div>
			{label !== undefined && (
				<figcaption
					className={`border-t-perforation border-dashed border-ink p-space-4 text-center font-display text-sticker text-ink ${TONES[tone]}`}
				>
					{label}
				</figcaption>
			)}
		</figure>
	);
}
