import { Div } from "./Element.ts";

import { Buffer } from "./Editor/Buffer.ts";
import { Pane } from "./Editor/Pane.ts";
import { Line } from "./Editor/Line.ts";
import { Status } from "./Editor/Status.ts";
import { Cursor, CursorShape } from "./Editor/Cursor.ts";
import { Tab } from "./Editor/Tab.ts";

enum EditorMode {
	Normal,
	Insert,
	Ex,
}

enum Input {
	Register,
	Command,
	Count,
	Replace,
	Input,
	Delete,
	Yank,
	None,
}

type Registers = {
	[key: string]: string;
};

class InputState {
	count: number = 1;
	register: string = '"';
	pending: Input = Input.None;
	replace: boolean = false;
	delete: boolean = false;
	yank: boolean = false;

	reset() {
		this.count = 1;
		this.register = '"';
		this.replace = false;
		this.delete = false;
		this.yank = false;
	}

	update(key: string): boolean {
		switch (this.pending) {
			case Input.None:
				this.reset();
				break;
			case Input.Replace:
				this.replace = key.length === 1;
				break;
			case Input.Yank:
				this.yank = true;
				break;
			case Input.Delete:
				this.delete = true;
				break;
		}

		if (this.pending === Input.Register && /^[*+"]$/.test(key)) {
			this.register = key;
			this.pending = Input.Command;
		} else if (this.pending === Input.Count && /^[1-9]$/.test(key)) {
			this.count = this.count * 10 + parseInt(key);
		} else if (/^[1-9]$/.test(key)) {
			this.count = parseInt(key);
			this.pending = Input.Count;
		} else if (key === '"') {
			this.pending = Input.Register;
		} else if (!this.verb() && key === "d") {
			this.pending = Input.Delete;
		} else if (!this.verb() && key === "r") {
			this.pending = Input.Replace;
		} else if (!this.verb() && key === "y") {
			this.pending = Input.Yank;
		} else {
			this.pending = Input.None;
		}

		return this.pending !== Input.None;
	}

	verb(): boolean {
		return this.replace || this.delete || this.yank;
	}
}

export class Editor extends Div {
	status: Status;
	tabs: Tab[] = [];
	buffers: Buffer[] = [];
	cursor: Cursor;
	mode: EditorMode = EditorMode.Normal;
	registers: Registers = {};

	lastBuffer: Buffer;

	constructor() {
		super("editor");
		this.node.contentEditable = "true";
		this.node.spellcheck = false;

		this.lastBuffer = this.attachTab().attachPane().attachBuffer();
		this.cursor = this.lastBuffer.attachCursor();

		this.status = this.appendChild(new Status(this));

		this.status.message("Welcome to vi.js :)");
		this.handleKey();
	}

	line(): Line {
		return this.cursor.line;
	}

	buffer(): Buffer {
		return this.line().buffer;
	}

	pane(): Pane {
		const pane = this.buffer().pane;
		if (pane === null) throw Error("Cursor in a Buffer not attached to a Pane");
		return pane;
	}

	attachBuffer(buffer: Buffer = new Buffer()): Buffer {
		if (!this.buffers.includes(buffer)) {
			this.buffers.push(buffer);
		}
		return buffer;
	}

	attachTab(tab: Tab = new Tab(this)): Tab {
		if (!this.tabs.includes(tab)) {
			this.tabs.push(this.appendChild(tab));
		}
		return tab;
	}

	handleKey(): void {
		let ctrl = false;
		const state = new InputState();

		this.node.addEventListener("keyup", (key: KeyboardEvent) => {
			switch (key.key) {
				case "Control":
					ctrl = false;
					break;
			}
		});

		this.node.addEventListener("keydown", (event: KeyboardEvent) => {
			event.preventDefault();

			switch (event.key) {
				case "Control":
					ctrl = true;
				/* falls through */
				case "Shift":
				case "Alt":
				case "Meta":
					return;
			}

			const key = (ctrl ? "Control+" : "") + event.key;

			if (this.mode === EditorMode.Normal) {
				this.handleNormalModeKey(key, state);
			} else if (this.mode == EditorMode.Insert) {
				this.handleInsertModeKey(key);
			} else if (this.mode == EditorMode.Ex) {
				this.handleExModeKey(key);
			}
		});
	}

	handleSimpleInput(key: string): boolean {
		if (key.length == 1) {
			this.line().pushL(key);
			return true;
		}
		return false;
	}

	pasteLines(lines: Array<string>, at: number, attach = 0) {
		for (let i = 1; i < lines.length; i++) {
			const line = this.buffer().attachLine(at + i);
			line.pushL(lines[i].trimEnd());
			if (i === attach)
				line.attachCursor(this.cursor, line.text().search(/\S|$/));
		}
	}

	pasteText(text: string, before: boolean) {
		if (text.length === 0) return;

		const lines = text.split(/\r\n|\r|\n/);

		if (before) {
			if (lines.length === 1) {
				this.line().pushL(this.cursor.bleR(text));
			} else if (lines[0].length === 0) {
				this.pasteLines(lines, this.line().index - 1, 1);
			} else {
				const first = lines[0].trimEnd();
				const saved =
					this.cursor.eat(first.slice(0, 1)) +
					this.line().popR(this.line().lengthR());
				this.line().pushR(first.slice(this.cursor.length()));
				this.pasteLines(lines, this.line().index, 0);
				this.buffer().lines[this.line().index - 1 + lines.length].pushL(saved);
			}
		} else {
			if (lines.length === 1) {
				this.line().pushL(this.cursor.eatR(text));
			} else if (lines[0].length === 0) {
				this.pasteLines(lines, this.line().index, 1);
			} else {
				const saved = this.line().popR(this.line().lengthR());
				this.line().pushR(this.cursor.bleL(lines[0].trimEnd()));
				this.pasteLines(lines, this.line().index, 0);
				this.buffer().lines[this.line().index - 1 + lines.length].pushL(saved);
			}
		}

		this.cursor.save();
	}

	paste(register: string, before = false) {
		if (register === "+" || register === "*") {
			this.status.message("Hint: You can press 'p' to confirm paste");
			navigator.clipboard
				.readText()
				.then((clipText) => {
					this.pasteText(clipText, before);
					this.status.message("");
				})
				.catch((error) => {
					if (error instanceof DOMException)
						this.status.message("Error: " + error.message);
				});
		} else if (/^["]$/.test(register)) {
			const text = this.registers[register];
			if (text !== undefined) this.pasteText(text, before);
		} else {
			this.status.message("Error: unknown register: '" + register + "'");
		}
	}

	handleNormalModeKey(key: string, state: InputState): void {
		if (state.update(key)) return;

		if (state.replace) {
			const count = state.count - 1;
			if (this.line().lengthR() >= count) {
				this.cursor.eat(key);
				if (count > 0) {
					this.line().popR(count);
					this.line().pushR(key.repeat(count));
				}
			}
			return;
		}

		switch (key) {
			case "I":
				this.cursor.moveL(this.line().lengthL());
			/* falls through */
			case "i":
				this.switchMode(EditorMode.Insert);
				this.cursor.bleR();
				this.cursor.save();
				break;
			case "A":
				this.cursor.moveR(this.line().lengthR());
			/* falls through */
			case "a":
				this.switchMode(EditorMode.Insert);
				this.cursor.bleL();
				this.cursor.save();
				break;
			case "o":
				this.switchMode(EditorMode.Insert);
				this.cursor.bleL();
				this.buffer()
					.attachLine(this.line().index + 1)
					.attachCursor(this.cursor);
				break;
			case "O":
				this.switchMode(EditorMode.Insert);
				this.cursor.bleL();
				this.buffer().attachLine(this.line().index).attachCursor(this.cursor);
				break;
			case "$":
				this.cursor.moveR(this.line().lengthR());
				this.cursor.save();
				break;
			case "0":
				this.cursor.moveL(this.line().lengthL());
				this.cursor.save();
				break;
			case "^":
				this.cursor.moveTo(this.line().text().search(/\S|$/));
				this.cursor.save();
				break;
			case "j":
				this.cursor.moveD();
				break;
			case "k":
				this.cursor.moveU();
				break;
			case "h":
				this.cursor.moveL(state.count);
				this.cursor.save();
				break;
			case "l":
				this.cursor.moveR(state.count);
				this.cursor.save();
				break;
			case "y":
				{
					let yanked = "";
					for (
						let i = 0, line: Line | null = this.line();
						i < state.count && line !== null;
						i++, line = line.next()
					) {
						yanked += "\n" + line.text();
					}
					this.registers[state.register] = yanked;
				}
				break;
			case "p":
				this.paste(state.register);
				break;
			case "P":
				this.paste(state.register, true);
				break;
			case "x":
				this.cursor.delRL();
				this.cursor.save();
				break;
			case ":":
				this.switchMode(EditorMode.Ex);
				break;
			default:
				this.status.message("Unbound key: " + key);
				break;
		}
	}

	handleInsertModeKey(key: string): void {
		if (this.handleSimpleInput(key)) {
			this.cursor.save();
			return;
		}

		switch (key) {
			case "ArrowLeft":
				this.cursor.moveL();
				this.cursor.save();
				break;
			case "ArrowRight":
				this.cursor.moveR();
				this.cursor.save();
				break;
			case "Backspace":
				this.cursor.delL();
				this.cursor.save();
				break;
			case "ArrowUp":
				this.cursor.moveU();
				break;
			case "ArrowDown":
				this.cursor.moveD();
				break;
			case "Enter":
				this.buffer()
					.attachLine(this.line().index + 1)
					.attachCursor(this.cursor);
				break;
			case "Control+c":
			case "Escape":
				this.switchMode(EditorMode.Normal);
				this.cursor.save();
				break;
			default:
				this.status.message("Unbound key: " + key);
				break;
		}
	}

	handleExModeKey(key: string): void {
		if (this.handleSimpleInput(key)) return;

		switch (key) {
			case "ArrowLeft":
				if (this.line().lengthL() > 1) this.cursor.moveL();
				break;
			case "ArrowRight":
				this.cursor.moveR();
				break;
			case "Backspace":
				if (this.line().lengthL() > 1) this.cursor.delL();
				break;
			case "Control+c":
			case "Escape":
				this.switchMode(EditorMode.Normal);
				this.status.message("");
				break;
			case "Enter":
				this.switchMode(EditorMode.Normal);
				if (this.status.line.lengthL() > 1)
					this.executeExCommand(
						this.status.line.popL(this.status.line.lengthL() - 1),
					);
				else this.status.message("");
				break;
			default:
				this.switchMode(EditorMode.Normal);
				this.status.message("Unbound key: " + key);
				break;
		}
	}

	executeExCommand(cmd: string | null): void {
		if (cmd === null) {
			this.status.message("");
			return;
		}

		const argv = cmd.split(" ");

		switch (argv[0]) {
			case "Hello":
			case "hello":
				this.status.message("Nice to meet you :)");
				break;
			default:
				this.status.message("Unknown command: " + argv[0]);
		}
	}

	switchMode(mode: EditorMode): void {
		if (mode == this.mode) return;

		switch (mode) {
			case EditorMode.Normal:
				if (this.mode == EditorMode.Ex)
					this.lastBuffer.attachCursor(this.cursor);
				this.cursor.setShape(CursorShape.Block);
				this.cursor.delLR();
				break;
			case EditorMode.Ex:
				this.cursor.setShape(CursorShape.Bar);
				this.cursor.bleR();
				this.lastBuffer = this.buffer();
				this.status.message(":");
				this.status.line.attachCursor(this.cursor, 1);
				break;
			case EditorMode.Insert:
				this.cursor.setShape(CursorShape.Bar);
				break;
		}

		this.mode = mode;
	}
}
