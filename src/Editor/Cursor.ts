import { Span } from "../Element.ts";
import { Line } from "./Line.ts";

export enum CursorShape {
	Block = "block",
	Bar = "bar",
}

export class Cursor extends Span {
	newline: boolean = true;
	static readonly newlineString: string = "⏎";
	text: Text;
	line: Line;
	column: number = 0;
	shape: CursorShape = CursorShape.Block;

	constructor(line: Line) {
		super("editor-cursor block");

		this.text = this.appendText(Cursor.newlineString);
		this.line = line;

		line.attachCursor(this);
	}

	attachLine(line: Line, column: number = this.column): Line {
		if (this.line !== line) {
			this.line.detachCursor();

			this.line = line;

			line.attachCursor(this, column);
			if (this.length() > 0) this.delLR();
			this.moveTo(column);
			this.column = column;
		}
		return this.line;
	}

	textContent(): string {
		return this.text.textContent === null ? "" : this.text.textContent;
	}

	setShape(shape: CursorShape): void {
		if (shape === this.shape) return;
		this.shape = shape;

		if (shape == CursorShape.Bar) {
			this.node.classList.replace(CursorShape.Block, CursorShape.Bar);
		} else {
			this.node.classList.replace(CursorShape.Bar, CursorShape.Block);
		}
	}

	length(): number {
		return this.shape == CursorShape.Block ? 1 : 0;
	}

	eat(char: string | null): string {
		if (char === null) return "";

		const txt = this.textContent();

		if (char.length === this.length()) this.text.textContent = char;

		this.newline = false;

		return txt;
	}

	bleR(): void {
		if (!this.newline) this.line.pushR(this.eat(""));
		else this.eat("");
	}

	bleL(): void {
		if (!this.newline) this.line.pushL(this.eat(""));
		else this.eat("");
	}

	delR(len = 1): string | null {
		let text = this.line.popR(len);
		if (text !== null) {
			const out = this.eat(text.slice(-1));
			text = out + text.slice(0, text.length - out.length);
		}
		return text;
	}

	delL(len = 1): string | null {
		let text = this.line.popL(len);
		if (text !== null) {
			const out = this.eat(text.slice(0, 1));
			text = text.slice(out.length) + out;
		}
		return text;
	}

	delLR(): void {
		if (this.delL() === null && this.delR() === null) {
			this.setNewline();
		}
	}

	delRL(): void {
		if (this.delR() === null && this.delL() === null) {
			this.setNewline();
		}
	}

	setNewline(): void {
		if (this.shape === CursorShape.Block) {
			this.newline = true;
			this.text.textContent = Cursor.newlineString;
		}
	}

	moveR(len = 1): void {
		this.line.pushL(this.delR(len));
	}

	moveL(len = 1): void {
		this.line.pushR(this.delL(len));
	}

	save(): void {
		this.column = this.line.lengthL();
	}

	moveTo(col: number): void {
		if (col > this.line.lengthL()) {
			this.moveR(col - this.line.lengthL());
		} else {
			this.moveL(this.line.lengthL() - col);
		}
	}
}
