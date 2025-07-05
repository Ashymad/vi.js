import { Div } from "./Element.ts";

import { Buffer } from "./Editor/Buffer.ts";
import { Status } from "./Editor/Status.ts";
import { Cursor, CursorShape } from "./Editor/Cursor.ts";
import { Tab } from "./Editor/Tab.ts";

enum EditorMode {
	Normal,
	Insert,
	Ex,
}

export class Editor extends Div {
	status: Status;
	tabs: Tab[] = [];
	buffers: Buffer[] = [];
	cursor: Cursor;
	mode: EditorMode = EditorMode.Normal;

	lastBuffer: Buffer;

	constructor() {
		super("editor");
		this.node.contentEditable = "true";
		this.node.spellcheck = false;

		this.lastBuffer = this.attachTab().attachPane().attachBuffer();
		this.cursor = new Cursor(this.lastBuffer.attachLine());

		this.status = new Status(this);

		this.status.message("Welcome to vi.js :)");
		this.handleKey();
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

			tab.attachEditor(this);
		}
		return tab;
	}

	attachStatus(status: Status = new Status(this)): Status {
		if (this.status !== status) {
			this.status = this.appendChild(status);

			status.attachEditor(this);
		}
		return status;
	}

	handleKey(): void {
		let ctrl = false;
		let count = 0;

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
				if (/^\d$/.test(key)) {
					count = count * 10 + parseInt(key);
				} else {
					this.handleNormalModeKey(key, count === 0 ? 1 : count);
					count = 0;
				}
			} else if (key.length == 1) {
				this.cursor.line.pushL(key);
				this.cursor.save();
			} else if (this.mode == EditorMode.Insert) {
				this.handleInsertModeKey(key);
			} else if (this.mode == EditorMode.Ex) {
				this.handleExModeKey(key);
			}
		});
	}

	handleSimpleInput(key: string): boolean {
		if (key.length == 1) {
			this.cursor.line.pushL(key);
			return true;
		}
		return false;
	}

	handleNormalModeKey(key: string, count: number): void {
		switch (key) {
			case "I":
				this.cursor.moveL(this.cursor.line.lengthL());
			/* falls through */
			case "i":
				this.switchMode(EditorMode.Insert);
				this.cursor.bleR();
				this.cursor.save();
				break;
			case "A":
				this.cursor.moveR(this.cursor.line.lengthR());
			/* falls through */
			case "a":
				this.switchMode(EditorMode.Insert);
				this.cursor.bleL();
				this.cursor.save();
				break;
			case "o":
				this.switchMode(EditorMode.Insert);
				this.cursor.bleL();
				this.cursor.line.buffer
					.attachLine(this.cursor.line.index + 1)
					.attachCursor(this.cursor);
				break;
			case "O":
				this.switchMode(EditorMode.Insert);
				this.cursor.bleL();
				this.cursor.line.buffer
					.attachLine(this.cursor.line.index)
					.attachCursor(this.cursor);
				break;
			case "j":
				this.cursor.line.next().attachCursor(this.cursor);
				break;
			case "k":
				this.cursor.line.prev().attachCursor(this.cursor);
				break;
			case "h":
				this.cursor.moveL(count);
				this.cursor.save();
				break;
			case "l":
				this.cursor.moveR(count);
				this.cursor.save();
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
				this.cursor.line.prev().attachCursor(this.cursor);
				break;
			case "ArrowDown":
				this.cursor.line.next().attachCursor(this.cursor);
				break;
			case "Enter":
				this.cursor.line.buffer
					.attachLine(this.cursor.line.index + 1)
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
				if (this.cursor.line.lengthL() > 1) this.cursor.moveL();
				break;
			case "ArrowRight":
				this.cursor.moveR();
				break;
			case "Backspace":
				if (this.cursor.line.lengthL() > 1) this.cursor.delL();
				break;
			case "Control+c":
			case "Escape":
				this.switchMode(EditorMode.Normal);
				this.status.message("");
				break;
			case "Enter":
				this.switchMode(EditorMode.Normal);
				if (this.status.info.lengthL() > 1)
					this.executeExCommand(
						this.status.info.popL(this.status.info.lengthL() - 1),
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
				this.lastBuffer = this.cursor.line.buffer;
				this.status.message(":");
				this.status.info.attachCursor(this.cursor, 1);
				break;
			case EditorMode.Insert:
				this.cursor.setShape(CursorShape.Bar);
				break;
		}

		this.mode = mode;
	}
}
