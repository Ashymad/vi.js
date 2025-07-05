import { Div } from "../Element.ts";
import { Editor } from "../Editor.ts";
import { StatusBuffer } from "./Buffer.ts";
import { Line } from "./Line.ts";

export class Status extends Div {
	buffer: StatusBuffer;
	editor: Editor;
	info: Line;

	constructor(editor: Editor) {
		super("editor-status");

		this.editor = editor;
		this.buffer = this.attachBuffer();
		this.info = this.buffer.attachLine();

		editor.attachStatus(this);
	}

	attachEditor(editor: Editor): Editor {
		if (this.editor !== editor) {
			this.editor = editor;

			editor.attachStatus(this);
		}
		return editor;
	}

	attachBuffer(buffer: StatusBuffer = new StatusBuffer(this)): StatusBuffer {
		if (this.buffer !== buffer) {
			this.buffer = this.replaceFirstChild(buffer);

			buffer.attachStatus(this);
		}
		return buffer;
	}

	message(msg: string): void {
		this.info.setL(msg);
	}
}
