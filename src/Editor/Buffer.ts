import { Div } from "../Element.ts";
import { Editor } from "../Editor.ts";
import { Line } from "./Line.ts";
import { Pane } from "./Pane.ts";
import { Status } from "./Status.ts";
import { Cursor } from "./Cursor.ts";

export type Position = {
	column: number;
	line: number;
};

export class Buffer extends Div {
	lines: Line[] = [];
	position: Position = { column: 0, line: 0 };
	cursor: Cursor | null = null;

	constructor(name: string) {
		super("editor-" + name + "-buffer");
	}

	attachCursor(cursor: Cursor, line = this.lines[this.position.line]): Cursor {
		if (this.cursor !== cursor) {
			this.cursor = cursor;

			if (line !== undefined) line.attachCursor(cursor, this.position.column);
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
		}
		return line;
	}
}

export class PaneBuffer extends Buffer {
	pane: Pane | null = null;
	editor: Editor;

	constructor(editor: Editor) {
		super("pane");

		this.editor = editor;

		editor.attachBuffer(this);
	}

	attachPane(pane: Pane): Pane {
		if (this.pane !== pane) {
			this.pane = pane;

			pane.attachBuffer(this);
		}
		return pane;
	}

	attachEditor(editor: Editor): Editor {
		if (this.editor !== editor) {
			this.editor = editor;

			editor.attachBuffer(this);
		}
		return editor;
	}
}

export class StatusBuffer extends Buffer {
	status: Status;

	constructor(status: Status) {
		super("status");

		this.status = status;

		status.attachBuffer(this);
	}

	attachStatus(status: Status): Status {
		if (this.status !== status) {
			this.status = status;

			status.attachBuffer(this);
		}
		return status;
	}
}
