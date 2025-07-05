import { Editor } from "./Editor.ts";

declare global {
    export namespace globalThis {
        var editor: Editor;
    }
}
