import type { ComponentType } from "react";

import type { IconName } from "@/shared/ui/icon";

import {
	type ContentOf,
	type EncodedContent,
	QR_CONTENT_TYPES,
	type QrContent,
} from "../../domain/qr-content";
import type { ContentFormProps } from "./forms/content-form";
import { EstekaForm } from "./forms/esteka-form";
import { TestuaForm } from "./forms/testua-form";

/** The types the generator offers: those with a form. */
export type OfferedType = QrContent["type"];

type EncodedOf<Type extends OfferedType> = Extract<EncodedContent, { type: Type }>;

/** Everything the page says about one type, so a new type is one entry here. */
interface ContentTypeUi<Type extends OfferedType> {
	/** The pill's label. */
	readonly label: string;
	readonly icon: IconName;
	readonly Form: ComponentType<ContentFormProps<Type>>;
	/** The content before anything is typed. */
	readonly empty: ContentOf<Type>;
	/** What the preview is named after, once the content is valid. */
	readonly previewName: (encoded: EncodedOf<Type>) => string;
	/** The preview's name while the content is invalid. */
	readonly waitingLabel: string;
}

const CONTENT_TYPES: { readonly [Type in OfferedType]: ContentTypeUi<Type> } = {
	esteka: {
		label: "Esteka",
		icon: "link",
		Form: EstekaForm,
		empty: { type: "esteka", link: "" },
		previewName: ({ link }) => link,
		waitingLabel: "QR kodearen aurrebista, esteka baliozko baten zain",
	},
	testua: {
		label: "Testua",
		icon: "text",
		Form: TestuaForm,
		empty: { type: "testua", text: "" },
		previewName: () => "testua",
		waitingLabel: "QR kodearen aurrebista, testu laburrago baten zain",
	},
};

/** Every offered type, in the design system's order. */
export const OFFERED_TYPES: readonly OfferedType[] = QR_CONTENT_TYPES.filter(
	(type): type is OfferedType => type in CONTENT_TYPES,
);

export function contentTypeUi<Type extends OfferedType>(type: Type): ContentTypeUi<Type> {
	return CONTENT_TYPES[type];
}

/** One empty content per type, to keep what was typed in each while switching. */
export type ContentDrafts = { readonly [Type in OfferedType]: ContentOf<Type> };

export const EMPTY_DRAFTS: ContentDrafts = {
	esteka: CONTENT_TYPES.esteka.empty,
	testua: CONTENT_TYPES.testua.empty,
};

function previewNameAs<Type extends OfferedType>(type: Type, encoded: EncodedOf<Type>): string {
	return contentTypeUi(type).previewName(encoded);
}

/** What the preview of valid content is named after: the link, or the type. */
export function previewNameOf(encoded: EncodedContent): string {
	return previewNameAs(encoded.type, encoded);
}
