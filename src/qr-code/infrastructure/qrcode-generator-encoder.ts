import createQrCode from "qrcode-generator";

import type { QrMatrixEncoder } from "../application/qr-matrix-encoder";
import type { QrMatrix } from "../domain/qr-matrix";

/**
 * Encodes with `qrcode-generator`: the smallest version that fits, at error correction level Q
 * (25%), which leaves room for rounded and diamond dots. Links arrive normalised by `new URL`, so
 * they are ASCII and the default byte encoding reads them back exactly.
 */
export class QrcodeGeneratorEncoder implements QrMatrixEncoder {
	encode(text: string): QrMatrix {
		const code = createQrCode(0, "Q");
		code.addData(text);
		code.make();
		const size = code.getModuleCount();
		return Array.from({ length: size }, (_, row) =>
			Array.from({ length: size }, (_unused, column) => code.isDark(row, column)),
		);
	}
}
