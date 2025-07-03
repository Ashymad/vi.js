import { Div } from "../Element.ts";
import { Editor } from "../Editor.ts";
import { Line } from "./Line.ts";
import { Pane } from "./Pane.ts";
import { Status } from "./Status.ts";

export class Buffer extends Div {
	lines: Line[] = [];

	constructor(name: string) {
		super("editor-" + name + "-buffer");
	}

	attachLine(line: Line = new Line(this), attached = false): Line {
		this.lines.push(this.appendChild(line));

		if (!attached) line.attachBuffer(this, true);
		return line;
	}
}

export class PaneBuffer extends Buffer {
	pane: Pane | null = null;
	editor: Editor;

	constructor(editor: Editor) {
		super("pane");
		this.editor = this.attachEditor(editor);
	}

	attachPane(pane: Pane, attached = false): Pane {
		this.pane = pane;

		if (!attached) pane.attachBuffer(this, true);
		return pane;
	}

	attachEditor(editor: Editor, attached = false): Editor {
		this.editor = editor;

		if (!attached) editor.attachBuffer(this, true);
		return editor;
	}
}

export class StatusBuffer extends Buffer {
	status: Status;

	constructor(status: Status) {
		super("status");
		this.status = this.attachStatus(status);
	}

	attachStatus(status: Status, attached = false): Status {
		this.status = status;

		if (!attached) status.attachBuffer(this, true);
		return status;
	}
}
