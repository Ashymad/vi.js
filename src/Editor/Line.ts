import { Div } from "../Element.ts";
import { Cursor } from "./Cursor.ts";
import { Buffer } from "./Buffer.ts";

export class Line extends Div {
	visible: boolean = true;
	lText: Text;
	rText: Text | null = null;
	cursor: Cursor | null = null;
	buffer: Buffer;
	index: number;

	constructor(buffer: Buffer, index: number) {
		super("editor-line");

		this.lText = this.appendText("");
		this.buffer = buffer;
		this.index = index;

		buffer.attachLine(index, this);
	}

	next(): Line {
		return this.buffer.lines.length > this.index + 1
			? this.buffer.lines[this.index + 1]
			: this;
	}

	prev(): Line {
		return this.index > 0 ? this.buffer.lines[this.index - 1] : this;
	}

	setL(text: string): void {
		this.lText.textContent = text;
	}

	lengthL(): number {
		return this.lText.textContent === null ? 0 : this.lText.textContent.length;
	}

	lengthR(): number {
		return this.rText === null || this.rText.textContent === null
			? 0
			: this.rText.textContent.length;
	}

	pushL(text: string | null): void {
		if (text !== null) this.lText.textContent += text;
	}

	pushR(text: string | null): void {
		if (text !== null && this.rText !== null)
			this.rText.textContent = text + this.rText.textContent;
	}

	popL(len = 1): string | null {
		if (
			len > 0 &&
			this.lText.textContent !== null &&
			this.lText.textContent.length > 0
		) {
			len = Math.min(len, this.lText.textContent.length);

			const text = this.lText.textContent.slice(-len);
			this.lText.textContent = this.lText.textContent.slice(0, -len);
			return text;
		}
		return null;
	}

	popR(len = 1): string | null {
		if (
			len > 0 &&
			this.rText !== null &&
			this.rText.textContent !== null &&
			this.rText.textContent.length > 0
		) {
			len = Math.min(len, this.rText.textContent.length);

			const text = this.rText.textContent.slice(0, len);
			this.rText.textContent = this.rText.textContent.slice(len);
			return text;
		}
		return null;
	}

	attachCursor(
		cursor: Cursor = new Cursor(this),
		column: number = cursor.column,
	): Cursor {
		if (this.cursor !== cursor) {
			this.cursor = this.appendChild(cursor);
			this.rText = this.appendText("");

			cursor.attachLine(this, column);
			this.buffer.attachCursor(cursor, this);
		}

		return cursor;
	}

	detachCursor(): Cursor | null {
		const cursor = this.cursor;
		this.cursor = null;

		if (cursor !== null) {
			this.buffer.detachCursor();

			this.pushL([cursor.textContent(), this.popR(this.lengthR())].join(""));
			this.removeLastChild();
			this.rText = null;
		}

		return cursor;
	}

	hide(): void {
		this.node.classList.add("invisible");
	}

	attachBuffer(index: number, buffer: Buffer): Buffer {
		if (this.buffer !== buffer) {
			this.buffer = buffer;
			this.index = index;

			buffer.attachLine(index, this);
		}
		return buffer;
	}
}
