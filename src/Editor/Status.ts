import { Pane } from "./Pane.ts";
import { Editor } from "../Editor.ts";
import { Line } from "./Line.ts";

export class Status extends Pane {
	info: Line;

	constructor(editor: Editor) {
		super(editor, "status");

		this.info = this.attachBuffer().attachLine();

		editor.attachStatus(this);
	}

	attachEditor(editor: Editor): Editor {
		if (this.editor !== editor) {
			this.editor = editor;

			editor.attachStatus(this);
		}
		return editor;
	}

	message(msg: string): void {
		this.info.setL(msg);
	}
}
