import { Editor } from "./Editor.ts";
import { Resizable } from "./Resizable.ts";

declare global {
	export namespace globalThis {
		var editor: Editor;
		var resizable: Resizable;
	}
}
