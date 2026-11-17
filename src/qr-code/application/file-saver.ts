export interface SavedFile {
	readonly name: string;
	readonly blob: Blob;
}

/** Hands a file to the person, as a download. */
export interface FileSaver {
	save(file: SavedFile): void;
}
