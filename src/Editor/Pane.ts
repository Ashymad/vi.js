import { Div } from "../Element.ts";
import { Buffer } from "./Buffer.ts";
import { Tab } from "./Tab.ts";
import { Editor } from "../Editor.ts";

export class Pane extends Div {
	buffer: Buffer | null = null;
	editor: Editor;

	constructor(editor: Editor, name: string) {
		super("editor-" + name + "-pane");

		this.editor = editor;
	}

	attachBuffer(buffer: Buffer = this.editor.attachBuffer()): Buffer {
		if (this.buffer !== buffer) {
			this.buffer = this.replaceFirstChild(buffer);

			buffer.attachPane(this);
		}
		return buffer;
	}
}

export class TabPane extends Pane {
	tab: Tab;

	constructor(tab: Tab) {
		super(tab.editor, "tab");

		this.tab = tab;
	}

	attachTab(tab: Tab): Tab {
		if (this.tab !== tab) {
			this.tab = tab;

			tab.attachPane(this);
		}
		return tab;
	}
}
