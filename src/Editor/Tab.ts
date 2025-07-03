import { Div } from "../Element.ts";
import { Pane } from "./Pane.ts";
import { Editor } from "../Editor.ts";

export class Tab extends Div {
	panes: Pane[] = [];
	editor: Editor;

	constructor(editor: Editor) {
		super("editor-tab");
		this.editor = editor;

		this.editor = this.attachEditor(editor);
	}

	attachPane(pane: Pane = new Pane(this), attached = false): Pane {
		this.panes.push(this.appendChild(pane));

		if (!attached) pane.attachTab(this, true);
		return pane;
	}

	attachEditor(editor: Editor, attached = false): Editor {
		this.editor = editor;

		if (!attached) editor.attachTab(this, true);
		return editor;
	}
}
