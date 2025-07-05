import "tachyons";
import "./index.css";
import { Editor } from "./Editor.ts";

const rootEl = document.querySelector("#root");
if (rootEl) {
	rootEl.innerHTML = `
  <div id="console-app-container" class="console-app fl mh3 mv2 pt4">
      <div class="shadow-3 br3">
          <div id="window-titlebar" class="titlebar bg-near-black pv2 br3 br--top">
              <div class="dib titlebar-buttons ml1 mr5 pl2">
                  <span class="dib titlebar-button br-100 bg-red"></span>
                  <span class="dib titlebar-button br-100 bg-yellow mh2"></span>
                  <span class="dib titlebar-button br-100 bg-green"></span>
              </div>
          </div>
          <div id="app-window" class="window bg-white pt3 light-silver h5 br2 br--bottom">
              <div id="editor-window" class="window-content ph3 ma0 code"></div>
          </div>
      </div>
  </div>
`;
}

const editor_window: HTMLDivElement | null =
	document.querySelector("#editor-window");

globalThis.edit = new Editor();

if (editor_window !== null) {
	editor_window.appendChild(globalThis.edit.node);
	editor_window.focus();
}
