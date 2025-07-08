import { Pane } from "./Pane.ts";
import { Editor } from "../Editor.ts";
import { Line } from "./Line.ts";

export class Status extends Pane {
	line: Line;

	constructor(editor: Editor) {
		super(editor, "status");

		this.line = this.attachBuffer().first;
	}

	message(msg: string): void {
		this.line.setL(msg);
	}
}
