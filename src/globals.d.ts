import { Editor } from "./Editor.ts";

declare global {
	namespace globalThis {
		const edit: Editor;
	}
}
