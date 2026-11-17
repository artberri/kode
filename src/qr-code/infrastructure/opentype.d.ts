// opentype.js 2.0 ships no types: these cover only the calls the frame text outliner makes. The
// outliner imports the ES module build by path, as bundlers otherwise disagree on which build to use.
declare module "opentype.js/dist/opentype.mjs" {
	export interface Path {
		/** `flipY` defaults to true, which flips the path upside down around its own bounds. */
		toPathData(options: { readonly decimalPlaces: number; readonly flipY: boolean }): string;
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
