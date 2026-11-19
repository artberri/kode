import createQrCode from "qrcode-generator";

import type { QrMatrixEncoder } from "../application/qr-matrix-encoder";
import type { QrMatrix } from "../domain/qr-matrix";

const UTF8 = new TextEncoder();

/**
 * One character per UTF-8 byte, each below U+0100. `qrcode-generator` writes a character's low
 * byte in byte mode, so the code holds the text's UTF-8 bytes, as phone cameras read them. This
 * avoids its `qrcode_UTF8` build, which works by replacing the library's shared `stringToBytes`.
 */
function utf8Bytes(text: string): string {
	return Array.from(UTF8.encode(text), (byte) => String.fromCodePoint(byte)).join("");
}

/**
 * Encodes with `qrcode-generator`: the smallest version that fits, at error correction level Q
 * (25%), which leaves room for rounded and diamond dots. The text is written as UTF-8 bytes, so
 * accents and symbols read back exactly.
 */
export class QrcodeGeneratorEncoder implements QrMatrixEncoder {
	encode(text: string): QrMatrix {
		const code = createQrCode(0, "Q");
		code.addData(utf8Bytes(text), "Byte");
		code.make();
		const size = code.getModuleCount();
		return Array.from({ length: size }, (_, row) =>
			Array.from({ length: size }, (_unused, column) => code.isDark(row, column)),
		);
	}
}
