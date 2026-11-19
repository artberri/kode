import { type ComponentType, useState } from "react";

import { StepLabel } from "@/shared/ui/step-label";
import { TabPanel, Tabs } from "@/shared/ui/tabs";

import type { QrDesign } from "../../domain/qr-design";
import { ColourPanel } from "./colour-panel";
import { type DesignChange, FramePanel, type PanelProps, ShapePanel } from "./design-panels";

type DesignTab = "frame" | "shape" | "colours";

const DESIGN_TABS = [
	{ id: "frame", label: "Markoa" },
	{ id: "shape", label: "Forma" },
	{ id: "colours", label: "Koloreak" },
] as const;

const PANELS: Record<DesignTab, ComponentType<PanelProps>> = {
	frame: FramePanel,
	shape: ShapePanel,
	colours: ColourPanel,
};

/** Step 2, "Diseinua": the frame, shape and colour tabs. */
export function DesignStep({
	design,
	undrawable,
	onChange,
}: {
	readonly design: QrDesign;
	/** The characters of the frame text that won't be drawn. */
	readonly undrawable: readonly string[];
	readonly onChange: DesignChange;
}) {
	const [tab, setTab] = useState<DesignTab>("frame");
	return (
		<fieldset
			aria-labelledby="step-design"
			className="m-0 flex min-w-0 flex-col gap-space-4 border-0 p-0"
		>
			<StepLabel step={2} id="step-design">
				Diseinua
			</StepLabel>
			<Tabs
				items={DESIGN_TABS}
				value={tab}
				onChange={setTab}
				label="Diseinua"
				idPrefix="design"
			/>
			{DESIGN_TABS.map(({ id }) => {
				const Panel = PANELS[id];
				return (
					<TabPanel
						key={id}
						id={id}
						idPrefix="design"
						selected={tab === id}
						className="pt-space-2"
					>
						<Panel design={design} undrawable={undrawable} onChange={onChange} />
					</TabPanel>
				);
			})}
		</fieldset>
	);
}
