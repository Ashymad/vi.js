import { Div } from "../Element.ts";
import { PaneBuffer } from "./Buffer.ts";
import { Tab } from "./Tab.ts";

export class Pane extends Div {
	buffer: PaneBuffer | null = null;
	tab: Tab;

	constructor(tab: Tab) {
		super("editor-pane");
		this.tab = tab;

		this.tab = this.attachTab(tab);
	}

	attachBuffer(
		buffer: PaneBuffer = this.tab.editor.attachBuffer(),
		attached = false,
	): PaneBuffer {
		this.buffer = this.replaceFirstChild(buffer);

		if (!attached) buffer.attachPane(this, true);
		return buffer;
	}

	attachTab(tab: Tab, attached = false): Tab {
		this.tab = tab;

		if (!attached) tab.attachPane(this, true);
		return tab;
	}
}
