import { Div } from "../Element.ts";
import { TabPane } from "./Pane.ts";
import { Editor } from "../Editor.ts";

export class Tab extends Div {
	panes: TabPane[] = [];
	editor: Editor;

	constructor(editor: Editor) {
		super("editor-tab");

		this.editor = editor;

		editor.attachTab(this);
	}

	attachPane(pane: TabPane = new TabPane(this)): TabPane {
		if (!this.panes.includes(pane)) {
			this.panes.push(this.appendChild(pane));

			pane.attachTab(this);
		}
		return pane;
	}

	attachEditor(editor: Editor): Editor {
		if (this.editor !== editor) {
			this.editor = editor;

			editor.attachTab(this);
		}
		return editor;
	}
}
