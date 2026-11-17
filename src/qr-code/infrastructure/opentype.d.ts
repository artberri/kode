// opentype.js 2.0 ships no types: these cover only the calls the frame text outliner makes.
declare module "opentype.js" {
	export interface Path {
		toPathData(options: { readonly decimalPlaces: number }): string;
	}

	export interface Font {
		readonly unitsPerEm: number;
		readonly ascender: number;
		readonly descender: number;
		/** 0 when the font has no glyph for the character. */
		charToGlyphIndex(character: string): number;
		getAdvanceWidth(text: string, fontSize: number): number;
		getPath(text: string, x: number, y: number, fontSize: number): Path;
	}

	export function parse(buffer: ArrayBuffer): Font;
}
