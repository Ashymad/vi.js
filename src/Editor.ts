import { Span, Div } from "./Element.ts";

class Cursor extends Span {
	newline: boolean = true;
	static readonly newlineString: string = "⏎";

	constructor() {
		super("editor-cursor block");
		this.appendText(Cursor.newlineString);
	}
}

class Status extends Div {
	info: Line;

	constructor() {
		super("editor-status");
		this.info = this.appendChild(new Line());
	}

	message(msg: string): void {
		this.info.setText(msg);
	}
}

class Pane extends Div {
	buffer: Buffer | null = null;

	constructor() {
		super("editor-pane");
	}

	attach(buffer: Buffer = new Buffer()): Buffer {
		return (this.buffer = this.replaceFirstChild(buffer));
	}
}

class Buffer extends Div {
	lines: Line[] = [];

	constructor() {
		super("editor-buffer");
	}

	push(line: Line = new Line()): Line {
		this.lines.push(line);
		return this.appendChild(line);
	}
}

class Line extends Div {
	visible: boolean = true;
	text: Text;

	constructor() {
		super("editor-line");
		this.text = this.appendText("");
	}

	setText(text: string) {
		this.text.textContent = text;
	}
}

export class Editor extends Div {
	status: Status;
	panes: Pane[] = [];
	buffers: Buffer[] = [];
	cursor: Cursor;

	constructor() {
		super("editor");

		this.status = new Status();
		this.cursor = new Cursor();

		const pane = new Pane();

		this.panes.push(pane);

		const buffer = pane.attach();

		this.buffers.push(buffer);
		buffer.push().appendChild(this.cursor);

		this.appendChild(pane);
		this.appendChild(this.status);

		this.status.message("Welcome to vi.js :)");
	}
}
