import "tachyons";
import "./index.css";
import { Editor } from "./Editor.ts";
import { makeResizableDiv } from "./Resizable.ts";

const rootEl = document.querySelector("#root");
if (rootEl) {
	rootEl.innerHTML = `
<div id="console-app-container" class="console-app fl mh3 mv2">
    <div class='resizers'>
        <div class='resizer top-left'></div>
        <div class='resizer top-right'></div>
        <div class='resizer bottom-left'></div>
        <div class='resizer bottom-right'></div>
    </div>
    <div id="shadow" class="shadow-3 br3">
        <div id="window-titlebar" class="titlebar bg-near-black pv2 br3 br--top">
            <div class="dib titlebar-buttons ml1 mr5 pl2">
                <span class="dib titlebar-button br-100 bg-red"></span>
                <span class="dib titlebar-button br-100 bg-yellow mh2"></span>
                <span class="dib titlebar-button br-100 bg-green"></span>
            </div>
        </div>
        <div id="app-window" class="window bg-white pt3 light-silver br2 br--bottom">
            <div id="editor-window" class="window-content ph3 ma0 code"></div>
        </div>
    </div>
</div>
`;
}

const editor_window: HTMLDivElement | null =
	document.querySelector("#editor-window");

makeResizableDiv("#console-app-container");

globalThis.editor = new Editor();

if (editor_window !== null) {
	editor_window.appendChild(globalThis.editor.node);
	editor_window.focus();
}
