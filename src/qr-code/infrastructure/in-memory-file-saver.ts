import type { FileSaver, SavedFile } from "../application/file-saver";

/** A file saver that keeps the files instead of downloading them. */
export class InMemoryFileSaver implements FileSaver {
	readonly saved: SavedFile[] = [];

	save(file: SavedFile): void {
		this.saved.push(file);
	}
}
