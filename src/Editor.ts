import { Div } from "./Element.ts";

import { PaneBuffer } from "./Editor/Buffer.ts";
import { Status } from "./Editor/Status.ts";
import { Cursor, CursorShape } from "./Editor/Cursor.ts";
import { Tab } from "./Editor/Tab.ts";

enum EditorMode {
	Normal,
	Insert,
}

export class Editor extends Div {
	status: Status;
	tabs: Tab[] = [];
	buffers: PaneBuffer[] = [];
	cursor: Cursor;
	mode: EditorMode = EditorMode.Normal;

	constructor() {
		super("editor");
		this.node.contentEditable = "true";
		this.node.spellcheck = false;

		this.cursor = this.attachTab()
			.attachPane()
			.attachBuffer()
			.attachLine()
			.attachCursor();
		this.status = this.attachStatus();

		this.status.message("Welcome to vi.js :)");
		this.handleKey();
	}

	attachBuffer(
		buffer: PaneBuffer = new PaneBuffer(this),
		attached = false,
	): PaneBuffer {
		this.buffers.push(buffer);

		if (!attached) buffer.attachEditor(this, true);
		return buffer;
	}

	attachTab(tab: Tab = new Tab(this), attached = false): Tab {
		this.tabs.push(this.appendChild(tab));

		if (!attached) tab.attachEditor(this, true);
		return tab;
	}

	attachStatus(status: Status = new Status(this), attached = false): Status {
		this.status = this.appendChild(status);

		if (!attached) status.attachEditor(this, true);
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
			} else {
				this.handleInsertModeKey(key);
			}
		});
	}

	handleNormalModeKey(key: string, count: number): void {
		switch (key) {
			case "i":
				this.switchMode(EditorMode.Insert);
				this.cursor.bleR();
				break;
			case "a":
				this.switchMode(EditorMode.Insert);
				this.cursor.bleL();
				break;
			case "o":
				this.switchMode(EditorMode.Insert);
				this.cursor.bleL();
				this.cursor.line.buffer.attachLine().attachCursor(this.cursor);
				break;
			case "h":
				this.cursor.moveL(count);
				break;
			case "l":
				this.cursor.moveR(count);
				break;
			case "x":
				this.cursor.delRL();
				break;
			default:
				this.status.message("Unbound key: " + key);
				break;
		}
	}

	handleInsertModeKey(key: string): void {
		switch (key) {
			case "ArrowLeft":
				this.cursor.moveL();
				break;
			case "ArrowRight":
				this.cursor.moveR();
				break;
			case "Backspace":
				this.cursor.delL();
				break;
			case "Control+c":
			case "Escape":
				this.switchMode(EditorMode.Normal);
				break;
			default:
				this.status.message("Unbound key: " + key);
				break;
		}
	}

	switchMode(mode: EditorMode): void {
		if (mode == this.mode) return;

		if (mode === EditorMode.Normal) {
			this.cursor.setShape(CursorShape.Block);
			this.cursor.delLR();
		} else {
			this.cursor.setShape(CursorShape.Bar);
		}

		this.mode = mode;
	}
}
