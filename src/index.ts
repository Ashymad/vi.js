import "tachyons";
import "./index.css";
import { Editor } from "./Editor.ts";
import { Resizable } from "./Resizable.ts";

const rootEl = document.querySelector("#root");
if (rootEl) {
	rootEl.innerHTML = `
<div id="console-app-container" class="console-app fl mh3 mv2">
    <div id="shadow" class="shadow-3 br3">
        <div id="window-titlebar" class="titlebar bg-near-black pv2 br3 br--top">
            <div class="dib titlebar-buttons ml1 mr5 pl2">
                <span class="dib titlebar-button br-100 bg-red"></span>
                <span class="dib titlebar-button br-100 bg-yellow mh2"></span>
                <span class="dib titlebar-button br-100 bg-green"></span>
            </div>
        </div>
        <div id="app-window" class="window bg-white o-90 pt3 light-silver br2 br--bottom">
            <div id="editor-window" class="window-content ph3 ma0 code"></div>
        </div>
    </div>
</div>
`;
}

const editor_window: HTMLDivElement | null =
	document.querySelector("#editor-window");

const console_app: HTMLDivElement | null = document.querySelector(
	"#console-app-container",
);

const titlebar: HTMLDivElement | null =
	document.querySelector("#window-titlebar");

if (editor_window === null || console_app === null || titlebar === null)
	throw Error("Couldn't find the editor window or the console app container");

globalThis.editor = new Editor();
globalThis.editor.appendTo(editor_window);

globalThis.resizable = new Resizable(console_app);
globalThis.resizable.enable();
globalThis.resizable.addMovable(titlebar);
globalThis.resizable.atResize(() => {
	globalThis.editor.buffer().reflow();
});

editor_window.focus();
