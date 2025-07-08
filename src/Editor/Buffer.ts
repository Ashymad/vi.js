import { Div } from "../Element.ts";
import { Line } from "./Line.ts";
import { Pane } from "./Pane.ts";
import { Cursor } from "./Cursor.ts";

export type Position = {
	column: number;
	line: number;
};

export class Buffer extends Div {
	lines: Line[] = [];
	position: Position = { column: 0, line: 0 };
	cursor: Cursor | null = null;
	pane: Pane | null = null;

	constructor() {
		super("editor-buffer");
	}

	attachCursor(cursor: Cursor, line = this.lines[this.position.line]): Cursor {
		if (this.cursor !== cursor && line !== undefined) {
			this.cursor = cursor;

			line.attachCursor(cursor, this.position.column);
		}
		return cursor;
	}

	detachCursor(): Cursor | null {
		const cursor = this.cursor;
		this.cursor = null;

		if (cursor !== null) {
			this.position.column = cursor.column;
			this.position.line = cursor.line.index;

			cursor.line.detachCursor();
		}
		return cursor;
	}

	attachLine(
		index: number = this.lines.length,
		line: Line = new Line(this, index),
	): Line {
		if (!this.lines.includes(line)) {
			this.lines.splice(index, 0, this.insertChild(index, line));
			for (let i = index + 1; i < this.lines.length; i++) {
				this.lines[i].index++;
			}
			line.attachBuffer(index, this);
			this.reflow();
		}
		return line;
	}

	reflow(
		line: Line | null = this.cursor === null ? null : this.cursor.line,
	): void {
		if (line === null) return;

		if (!line.visible) {
		}
	}

	attachPane(pane: Pane): Pane {
		if (this.pane !== pane) {
			this.pane = pane;

			pane.attachBuffer(this);
		}
		return pane;
	}
}
