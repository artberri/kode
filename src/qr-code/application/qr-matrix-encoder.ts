import type { QrMatrix } from "../domain/qr-matrix";

/** Turns text into the module matrix of a QR code. */
export interface QrMatrixEncoder {
	encode(text: string): QrMatrix;
}
