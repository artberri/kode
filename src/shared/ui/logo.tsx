const CELLS = [
	{ x: 2, y: 2, fill: "fill-lilac", inner: "fill-ink" },
	{ x: 21, y: 2, fill: "fill-butter", inner: "fill-ink" },
	{ x: 2, y: 21, fill: "fill-mint", inner: "fill-ink" },
	{ x: 21, y: 21, fill: "fill-ink", inner: "fill-peach" },
] as const;

function LogoMark({ size, label }: { readonly size: number; readonly label?: string }) {
	return (
		<svg
			viewBox="0 0 40 40"
			width={size}
			height={size}
			role={label === undefined ? undefined : "img"}
			aria-label={label}
			aria-hidden={label === undefined ? true : undefined}
			className="block flex-none"
		>
			{CELLS.map(({ x, y, fill, inner }) => (
				<g key={`${String(x)}-${String(y)}`}>
					<rect x={x} y={y} width={17} height={17} rx={6} className={fill} />
					<rect x={x + 6} y={y + 6} width={5} height={5} rx={1.6} className={inner} />
				</g>
			))}
		</svg>
	);
}

export interface LogoProps {
	/** `full` (mark and "kode" wordmark, the default) or `mark` alone. */
	readonly variant?: "full" | "mark";
	/** Mark size in px. Default 42. */
	readonly size?: number;
	/** Makes the logo a link, normally to the home page. */
	readonly href?: string;
	readonly className?: string;
}

/** The KODE mark: four rounded QR corner squares, and the lowercase "kode" wordmark. */
export function Logo({ variant = "full", size = 42, href, className }: LogoProps) {
	const classes = ["inline-flex items-center gap-space-3 text-ink no-underline", className]
		.filter(Boolean)
		.join(" ");
	if (variant === "mark") {
		const mark = <LogoMark size={size} label="kode" />;
		return href === undefined ? (
			<span className={classes}>{mark}</span>
		) : (
			<a href={href} className={classes}>
				{mark}
			</a>
		);
	}
	const content = (
		<>
			<LogoMark size={size} />
			<span className="font-display text-wordmark">kode</span>
		</>
	);
	return href === undefined ? (
		<span className={classes}>{content}</span>
	) : (
		<a href={href} aria-label="kode, hasiera" className={classes}>
			{content}
		</a>
	);
}
