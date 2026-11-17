import type { MouseEventHandler, ReactNode } from "react";

import { Icon, type IconName } from "./icon";

export type ButtonVariant = "primary" | "secondary" | "outline";
export type ButtonSize = "md" | "lg";

interface CommonProps {
	/** `primary` lilac, at most one per view; `secondary` ink; `outline` white. Default `primary`. */
	readonly variant?: ButtonVariant;
	/** `md` 46px tall (default), `lg` 56px. */
	readonly size?: ButtonSize;
	/** A leading icon, only when it adds meaning. */
	readonly icon?: IconName;
	/** Fills its container's width. */
	readonly block?: boolean;
	/** An imperative verb in Basque, sentence case: "Deskargatu PNG". */
	readonly children: ReactNode;
	readonly className?: string;
}

interface ActionProps extends CommonProps {
	readonly href?: undefined;
	readonly type?: "button" | "submit";
	/** Dashed and grey; say why next to it. */
	readonly disabled?: boolean;
	readonly onClick?: MouseEventHandler<HTMLButtonElement>;
}

interface LinkProps extends CommonProps {
	/** Renders a link styled as a button, for navigation. */
	readonly href: string;
}

export type ButtonProps = ActionProps | LinkProps;

const BASE =
	"inline-flex items-center justify-center gap-2.5 rounded-pill border-firm border-ink font-body font-bold " +
	"no-underline cursor-pointer transition-transform duration-[120ms] " +
	"not-disabled:hover:-translate-y-px not-disabled:active:translate-y-px " +
	"motion-reduce:transition-none motion-reduce:transform-none " +
	"focus-visible:outline-focus focus-visible:outline-offset-2 focus-visible:outline-violet " +
	"disabled:cursor-not-allowed disabled:border-dashed disabled:border-line-strong " +
	"disabled:bg-surface disabled:text-ink-subtle";

const VARIANTS: Record<ButtonVariant, string> = {
	primary: "bg-lilac text-ink",
	secondary: "bg-ink text-on-ink",
	outline: "bg-surface-raised text-ink",
};

const SIZES: Record<ButtonSize, { readonly box: string; readonly icon: number }> = {
	md: { box: "min-h-[46px] px-[22px] text-[15px]", icon: 18 },
	lg: { box: "min-h-14 px-7 text-button", icon: 22 },
};

/** A pill button with a firm ink border; with `href`, a link that looks like one. */
export function Button(props: ButtonProps) {
	const { variant = "primary", size = "md", icon, block = false, children, className } = props;
	const classes = [BASE, VARIANTS[variant], SIZES[size].box, block && "w-full", className]
		.filter(Boolean)
		.join(" ");
	const content = (
		<>
			{icon !== undefined && <Icon name={icon} size={SIZES[size].icon} />}
			<span>{children}</span>
		</>
	);
	if (props.href !== undefined) {
		return (
			<a href={props.href} className={classes}>
				{content}
			</a>
		);
	}
	return (
		<button
			type={props.type ?? "button"}
			disabled={props.disabled}
			onClick={props.onClick}
			className={classes}
		>
			{content}
		</button>
	);
}
