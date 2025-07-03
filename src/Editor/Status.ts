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

		this.editor = this.attachEditor(editor);
		this.buffer = this.attachBuffer();
		this.info = this.buffer.attachLine();
	}

	attachEditor(editor: Editor, attached = false): Editor {
		this.editor = editor;

		if (!attached) editor.attachStatus(this, true);
		return editor;
	}

	attachBuffer(
		buffer: StatusBuffer = new StatusBuffer(this),
		attached = false,
	): StatusBuffer {
		this.buffer = this.replaceFirstChild(buffer);

		if (!attached) buffer.attachStatus(this, true);
		return buffer;
	}

	message(msg: string): void {
		this.info.setL(msg);
	}
}
