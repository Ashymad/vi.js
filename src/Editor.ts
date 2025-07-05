import { Div } from "./Element.ts";

import { PaneBuffer, Buffer } from "./Editor/Buffer.ts";
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
	buffers: PaneBuffer[] = [];
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

	attachBuffer(buffer: PaneBuffer = new PaneBuffer(this)): PaneBuffer {
		if (!this.buffers.includes(buffer)) {
			this.buffers.push(buffer);

			buffer.attachEditor(this);
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

	handleSimpleInput(key: string, save = false): boolean {
		if (key.length == 1) {
			this.cursor.line.pushL(key);
			if (save) this.cursor.save();
		} else {
			switch (key) {
				case "ArrowLeft":
					this.cursor.moveL();
					if (save) this.cursor.save();
					break;
				case "ArrowRight":
					this.cursor.moveR();
					if (save) this.cursor.save();
					break;
				case "Backspace":
					this.cursor.delL();
					if (save) this.cursor.save();
					break;
				default:
					return false;
			}
		}
		return true;
	}

	handleNormalModeKey(key: string, count: number): void {
		switch (key) {
			case "i":
				this.switchMode(EditorMode.Insert);
				this.cursor.bleR();
				this.cursor.save();
				break;
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
		if (this.handleSimpleInput(key, true)) return;
		switch (key) {
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
		if (this.handleSimpleInput(key, false)) return;

		switch (key) {
			default:
				this.status.message("Unbound key: " + key);
				this.switchMode(EditorMode.Normal);
				this.lastBuffer.attachCursor(this.cursor);
				break;
			case "Enter":
			case "Control+c":
			case "Escape":
				this.switchMode(EditorMode.Normal);
				this.lastBuffer.attachCursor(this.cursor);
				break;
		}
	}

	switchMode(mode: EditorMode): void {
		if (mode == this.mode) return;

		switch (mode) {
			case EditorMode.Normal:
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
