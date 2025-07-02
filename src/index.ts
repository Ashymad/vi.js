import 'tachyons'
import './index.css';
import {editor} from './script.js';

const rootEl = document.querySelector('#root');
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
              <div class="window-content ph3 ma0 code">
                  <div class="editor" contenteditable="true" spellcheck="false">
                      <div id="pane" class="editor-pane">
                          <div><span id=cursor class=block>f</span>unction exammple() {</div>
                          <div>    return 42;</div>
                          <div>}</div>
                      </div>
                          <div class="editor-status"><div id="status">Hello to vi.js :)</div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </div>
`;
}

const el = document.querySelector(".editor");
el.focus();
editor(el);
