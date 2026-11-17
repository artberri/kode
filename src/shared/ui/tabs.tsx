import { type KeyboardEvent, type ReactNode, useCallback } from "react";

export interface TabItem<Id extends string> {
	readonly id: Id;
	readonly label: string;
}

export interface TabsProps<Id extends string> {
	readonly items: readonly TabItem<Id>[];
	readonly value: Id;
	readonly onChange: (id: Id) => void;
	/** Accessible name of the tab list. */
	readonly label: string;
	/** Prefix for the tab and panel ids: `<prefix>-tab-<id>` controls `<prefix>-panel-<id>`. */
	readonly idPrefix: string;
	readonly className?: string;
}

function tabId(idPrefix: string, id: string): string {
	return `${idPrefix}-tab-${id}`;
}

function panelId(idPrefix: string, id: string): string {
	return `${idPrefix}-panel-${id}`;
}

/** Where each key moves from the tab at `index` of `count`, wrapping at the ends. */
const MOVES: Record<string, (index: number, count: number) => number> = {
	ArrowRight: (index, count) => (index + 1) % count,
	ArrowLeft: (index, count) => (index - 1 + count) % count,
	Home: () => 0,
	End: (_index, count) => count - 1,
};

const TAB =
	"-mb-0.5 min-h-11 cursor-pointer border-b-4 border-transparent bg-transparent pb-2.5 text-body " +
	"font-medium text-ink-subtle aria-selected:border-violet aria-selected:font-bold aria-selected:text-ink";

function Tab<Id extends string>({
	item,
	selected,
	idPrefix,
	onSelect,
	onKeyDown,
}: {
	readonly item: TabItem<Id>;
	readonly selected: boolean;
	readonly idPrefix: string;
	readonly onSelect: (id: Id) => void;
	readonly onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => void;
}) {
	const select = useCallback(() => {
		onSelect(item.id);
	}, [onSelect, item.id]);
	return (
		<button
			type="button"
			role="tab"
			id={tabId(idPrefix, item.id)}
			aria-selected={selected}
			aria-controls={panelId(idPrefix, item.id)}
			tabIndex={selected ? 0 : -1}
			onClick={select}
			onKeyDown={onKeyDown}
			className={TAB}
		>
			{item.label}
		</button>
	);
}

/** Arrow keys, Home and End select another tab and move the focus to it. */
function useArrowKeys<Id extends string>(
	items: readonly TabItem<Id>[],
	value: Id,
	onChange: (id: Id) => void,
): (event: KeyboardEvent<HTMLButtonElement>) => void {
	return useCallback(
		(event: KeyboardEvent<HTMLButtonElement>) => {
			const move = MOVES[event.key];
			if (move === undefined) {
				return;
			}
			event.preventDefault();
			const index = move(
				items.findIndex((item) => item.id === value),
				items.length,
			);
			const next = items[index];
			if (next !== undefined) {
				onChange(next.id);
				// The tabs are the tab list's only children, in the order of `items`.
				const tab = event.currentTarget.parentElement?.children.item(index);
				if (tab instanceof HTMLElement) {
					tab.focus();
				}
			}
		},
		[items, value, onChange],
	);
}

/**
 * Underline tabs that switch between panels of one step. Arrow keys move and select, Home and End
 * jump to the ends, and only the selected tab is in the tab order. Render each panel with
 * `TabPanel` and the same `idPrefix`.
 */
export function Tabs<Id extends string>({
	items,
	value,
	onChange,
	label,
	idPrefix,
	className,
}: TabsProps<Id>) {
	const handleKeyDown = useArrowKeys(items, value, onChange);
	return (
		<div
			role="tablist"
			aria-label={label}
			className={["flex flex-wrap gap-x-[26px] border-b-soft border-line", className]
				.filter(Boolean)
				.join(" ")}
		>
			{items.map((item) => (
				<Tab
					key={item.id}
					item={item}
					selected={item.id === value}
					idPrefix={idPrefix}
					onSelect={onChange}
					onKeyDown={handleKeyDown}
				/>
			))}
		</div>
	);
}

export interface TabPanelProps {
	/** The id of the tab that shows this panel. */
	readonly id: string;
	readonly idPrefix: string;
	readonly selected: boolean;
	readonly children: ReactNode;
	readonly className?: string;
}

/** A panel of `Tabs`, named by its tab. Hidden, not unmounted, while another tab is selected. */
export function TabPanel({ id, idPrefix, selected, children, className }: TabPanelProps) {
	return (
		<div
			role="tabpanel"
			id={panelId(idPrefix, id)}
			aria-labelledby={tabId(idPrefix, id)}
			hidden={!selected}
			className={className}
		>
			{children}
		</div>
	);
}
