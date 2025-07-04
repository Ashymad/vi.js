import { Div } from "../Element.ts";
import { Cursor } from "./Cursor.ts";
import { Buffer } from "./Buffer.ts";

export class Line extends Div {
	visible: boolean = true;
	lText: Text;
	rText: Text | null = null;
	cursor: Cursor | null = null;
	buffer: Buffer;
	readonly index: number;

	constructor(buffer: Buffer, index: number) {
		super("editor-line");
		this.lText = this.appendText("");
		this.index = index;

		this.buffer = this.attachBuffer(buffer);
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
		if (this.lText.textContent !== null && this.lText.textContent.length > 0) {
			len = Math.min(len, this.lText.textContent.length);

			const text = this.lText.textContent.slice(-len);
			this.lText.textContent = this.lText.textContent.slice(0, -len);
			return text;
		}
		return null;
	}

	popR(len = 1): string | null {
		if (
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
		_attached = false,
	): Cursor {
		this.cursor = this.appendChild(cursor);
		this.rText = this.appendText("");
		this.buffer.attachCursor(cursor, true);

		if (cursor.line !== this) cursor.attachLine(this, column, true);
		return cursor;
	}

	detachCursor(detached = false): Cursor | null {
		const cursor = this.cursor;

		if (cursor !== null) {
			if (!detached) this.buffer.detachCursor(true);
			this.pushL([cursor.textContent(), this.popR(this.lengthR())].join(""));
			this.removeLastChild();

			this.cursor = null;
			this.rText = null;
		}

		return cursor;
	}

	attachBuffer(buffer: Buffer, attached = false): Buffer {
		this.buffer = buffer;

		if (!attached) buffer.attachLine(this, true);
		return buffer;
	}
}
