import { type ComponentType, useState } from "react";

import { StepLabel } from "@/shared/ui/step-label";
import { TabPanel, Tabs } from "@/shared/ui/tabs";

import type { QrDesign } from "../../domain/qr-design";
import { ColourPanel } from "./colour-panel";
import { type DesignChange, FramePanel, type PanelProps, ShapePanel } from "./design-panels";

type DesignTab = "markoa" | "forma" | "koloreak";

const DESIGN_TABS = [
	{ id: "markoa", label: "Markoa" },
	{ id: "forma", label: "Forma" },
	{ id: "koloreak", label: "Koloreak" },
] as const;

const PANELS: Record<DesignTab, ComponentType<PanelProps>> = {
	markoa: FramePanel,
	forma: ShapePanel,
	koloreak: ColourPanel,
};

/** Step 2, "Diseinua": the frame, shape and colour tabs. */
export function DesignStep({
	design,
	onChange,
}: {
	readonly design: QrDesign;
	readonly onChange: DesignChange;
}) {
	const [tab, setTab] = useState<DesignTab>("markoa");
	return (
		<fieldset
			aria-labelledby="urratsa-diseinua"
			className="m-0 flex min-w-0 flex-col gap-space-4 border-0 p-0"
		>
			<StepLabel step={2} id="urratsa-diseinua">
				Diseinua
			</StepLabel>
			<Tabs
				items={DESIGN_TABS}
				value={tab}
				onChange={setTab}
				label="Diseinua"
				idPrefix="diseinua"
			/>
			{DESIGN_TABS.map(({ id }) => {
				const Panel = PANELS[id];
				return (
					<TabPanel
						key={id}
						id={id}
						idPrefix="diseinua"
						selected={tab === id}
						className="pt-space-2"
					>
						<Panel design={design} onChange={onChange} />
					</TabPanel>
				);
			})}
		</fieldset>
	);
}
