import { useCallback, useState } from "react";

import { ChoiceChips } from "@/shared/ui/choice-chips";
import { StepLabel } from "@/shared/ui/step-label";

import type { DesignQrCodeResult } from "../../application/design-qr-code";
import type { ContentOf, QrContent } from "../../domain/qr-content";
import {
	type ContentDrafts,
	contentTypeUi,
	EMPTY_DRAFTS,
	OFFERED_TYPES,
	type OfferedType,
} from "./content-types";

const TYPE_CHIPS = OFFERED_TYPES.map((type) => {
	const { label, icon } = contentTypeUi(type);
	return { value: type, label, icon };
});

/**
 * The selected type's content, keeping what was typed in every type for the visit, in memory
 * only, so switching back shows it again.
 */
export function useContent() {
	const [type, setType] = useState<OfferedType>("link");
	const [drafts, setDrafts] = useState<ContentDrafts>(EMPTY_DRAFTS);
	const changeContent = useCallback((next: QrContent) => {
		setDrafts((current) => ({ ...current, [next.type]: next }));
	}, []);
	return { content: drafts[type], setType, changeContent };
}

/** The selected type's form, typed by its type. */
function TypeForm<Type extends OfferedType>({
	type,
	content,
	onChange,
	result,
}: {
	readonly type: Type;
	readonly content: ContentOf<Type>;
	readonly onChange: (content: QrContent) => void;
	readonly result: DesignQrCodeResult;
}) {
	const { Form } = contentTypeUi(type);
	return <Form content={content} onChange={onChange} result={result} />;
}

export interface ContentStepProps {
	/** The selected type's content, as typed. */
	readonly content: QrContent;
	readonly onTypeChange: (type: OfferedType) => void;
	readonly onChange: (content: QrContent) => void;
	readonly result: DesignQrCodeResult;
}

/** Step 1, "Edukia": what to share, as type pills, then that type's fields. */
export function ContentStep({ content, onTypeChange, onChange, result }: ContentStepProps) {
	return (
		<fieldset
			aria-labelledby="step-content"
			className="m-0 flex min-w-0 flex-col gap-space-5 border-0 p-0"
		>
			<StepLabel step={1} id="step-content">
				Edukia
			</StepLabel>
			<ChoiceChips
				name="content-type"
				legend="Zer partekatu nahi duzu?"
				items={TYPE_CHIPS}
				value={content.type}
				onChange={onTypeChange}
			/>
			<TypeForm type={content.type} content={content} onChange={onChange} result={result} />
		</fieldset>
	);
}
