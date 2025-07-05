import { Div } from "../Element.ts";
import { PaneBuffer } from "./Buffer.ts";
import { Tab } from "./Tab.ts";

export class Pane extends Div {
	buffer: PaneBuffer | null = null;
	tab: Tab;

	constructor(tab: Tab) {
		super("editor-pane");

		this.tab = tab;

		tab.attachPane(this);
	}

	attachBuffer(
		buffer: PaneBuffer = this.tab.editor.attachBuffer(),
	): PaneBuffer {
		if (this.buffer !== buffer) {
			this.buffer = this.replaceFirstChild(buffer);

			buffer.attachPane(this);
		}
		return buffer;
	}

	attachTab(tab: Tab): Tab {
		if (this.tab !== tab) {
			this.tab = tab;

			tab.attachPane(this);
		}
		return tab;
	}
}
