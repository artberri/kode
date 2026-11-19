export type IconName =
	| "link"
	| "download"
	| "warning"
	| "check"
	| "error"
	| "none"
	| "scan"
	/** QR content types. */
	| "text";

const PATHS: Record<IconName, readonly string[]> = {
	link: [
		"M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1",
		"M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1",
	],
	download: ["M12 4 V15", "M7 10.5 L12 15.5 L17 10.5", "M5 20 H19"],
	warning: ["M12 3 L22 20 H2 Z", "M12 10 V14", "M12 17 V17.5"],
	check: ["M5 12.5 L10 17 L19 7"],
	error: ["M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18", "M12 8 V13", "M12 16.5 V17"],
	none: ["M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18", "M5.6 18.4 L18.4 5.6"],
	scan: [
		"M4 8V5a1 1 0 0 1 1-1h3",
		"M16 4h3a1 1 0 0 1 1 1v3",
		"M20 16v3a1 1 0 0 1-1 1h-3",
		"M8 20H5a1 1 0 0 1-1-1v-3",
		"M7 12 H17",
	],
	text: ["M5 6 H19", "M5 10 H19", "M5 14 H15", "M5 18 H12"],
};

export interface IconProps {
	readonly name: IconName;
	/** In px. Default 22. */
	readonly size?: number;
	readonly strokeWidth?: number;
	/** Accessible name; leave it out when the icon sits next to text, which then carries the meaning. */
	readonly label?: string;
	readonly className?: string;
}

/** Inline stroke icons on a 24px grid, drawn in `currentColor`. */
export function Icon({ name, size = 22, strokeWidth = 2.4, label, className }: IconProps) {
	const named = label !== undefined && label !== "";
	return (
		<svg
			className={["block flex-none", className].filter(Boolean).join(" ")}
			viewBox="0 0 24 24"
			width={size}
			height={size}
			fill="none"
			stroke="currentColor"
			strokeWidth={strokeWidth}
			strokeLinecap="round"
			strokeLinejoin="round"
			role={named ? "img" : undefined}
			aria-label={named ? label : undefined}
			aria-hidden={named ? undefined : true}
		>
			{PATHS[name].map((d) => (
				<path key={d} d={d} />
			))}
		</svg>
	);
}
