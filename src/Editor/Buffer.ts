import { Div } from "../Element.ts";
import { Line } from "./Line.ts";
import { Pane } from "./Pane.ts";
import { Cursor } from "./Cursor.ts";

export type Position = {
	column: number;
	line: Line;
};

export class Buffer extends Div {
	lines: Line[] = [];
	position: Position;
	cursor: Cursor | null = null;
	pane: Pane | null = null;
	first: Line;
	last: Line;
	reflow_disabled = false;

	constructor(line: Line | null = null) {
		super("editor-buffer");

		if (line === null) line = new Line(this, 0);

		this.lines.push(this.appendChild(line));
		this.first = line;
		this.last = line;
		this.position = { column: 0, line: line };
	}

	disable_reflow() {
		this.reflow_disabled = true;
	}

	enable_reflow() {
		this.reflow_disabled = false;
	}

	attachCursor(
		cursor: Cursor = new Cursor(this.position.line),
		line = this.position.line,
	): Cursor {
		if (this.cursor !== cursor) {
			this.cursor = cursor;

			line.attachCursor(cursor, this.position.column);
			if (!line.visible) this.reflow();
		}
		return cursor;
	}

	detachCursor(): Cursor | null {
		const cursor = this.cursor;
		this.cursor = null;

		if (cursor !== null) {
			this.position.column = cursor.column;
			this.position.line = cursor.line;

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
			if (index > this.last.index || index <= this.first.index) line.hide();
			this.reflow();
		}
		return line;
	}

	reflow(
		line: Line | null = this.cursor === null ? null : this.cursor.line,
	): void {
		if (line === null || this.pane === null || this.reflow_disabled) return;

		if (!line.visible) {
			for (
				let l = this.first.prev();
				l !== null && l.index >= line.index;
				l = l.prev()
			)
				(this.first = l).show();
			for (
				let l = this.last.next();
				l !== null && l.index <= line.index;
				l = l.next()
			)
				(this.last = l).show();
		}

		for (
			let l: Line | null = this.last;
			l !== null &&
			(this.last = l) &&
			l.index > line.index &&
			this.scrollHeight() > this.pane.clientHeight();
			l = l.prev()
		)
			l.hide();

		for (
			let l: Line | null = this.first;
			l !== null &&
			(this.first = l) &&
			l.index < line.index &&
			this.scrollHeight() > this.pane.clientHeight();
			l = l.next()
		)
			l.hide();

		for (
			let l = this.first.prev();
			l !== null &&
			l.scrollHeight() + this.scrollHeight() < this.pane.clientHeight();
			l = l.prev()
		)
			(this.first = l).show();

		for (
			let l = this.last.next();
			l !== null &&
			l.scrollHeight() + this.scrollHeight() < this.pane.clientHeight();
			l = l.next()
		)
			(this.last = l).show();
	}

	attachPane(pane: Pane): Pane {
		if (this.pane !== pane) {
			this.pane = pane;

			pane.attachBuffer(this);
		}
		return pane;
	}
}
