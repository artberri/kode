import type { DesignQrCodeResult } from "../../../application/design-qr-code";
import type { ContentOf, QrContent } from "../../../domain/qr-content";

/** What every type's form takes: its own content, and the design result to word its messages. */
export interface ContentFormProps<Type extends QrContent["type"]> {
	readonly content: ContentOf<Type>;
	readonly onChange: (content: ContentOf<Type>) => void;
	readonly result: DesignQrCodeResult;
}
