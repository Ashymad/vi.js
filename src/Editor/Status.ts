import { Pane } from "./Pane.ts";
import { Editor } from "../Editor.ts";
import { Line } from "./Line.ts";

export class Status extends Pane {
	cmd: Line;
	info: Line;

	constructor(editor: Editor) {
		super(editor, "status");

		const buffer = this.attachBuffer();
		buffer.disable_reflow();
		this.cmd = buffer.first;
		this.info = buffer.attachLine();
		this.info.show();
		this.info.node.style.right = "0";
		this.info.node.style.position = "inherit";
	}

	message(msg: string): void {
		this.cmd.setL(msg);
	}

	status(msg: string, append = false): void {
		if (append) this.info.pushL(msg);
		else this.info.setL(msg);
	}
}
