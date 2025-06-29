// Syntax highlight for JS
const editor = (el) => {
    const rightMove = (distance = 1) => {
        const cursor = document.getElementById("cursor")
        distance = cursor.nextSibling.textContent.length > distance ? distance : cursor.nextSibling.textContent.length;
        if (distance > 0) {
            cursor.firstChild.textContent += cursor.nextSibling.textContent.slice(0, distance);
            cursor.previousSibling.textContent += cursor.firstChild.textContent.slice(0, distance);
            cursor.nextSibling.textContent = cursor.nextSibling.textContent.slice(distance);
            cursor.firstChild.textContent = cursor.firstChild.textContent.slice(distance)
        }
    };

    const leftMove = (distance = 1) => {
        const cursor = document.getElementById("cursor")
        distance = cursor.previousSibling.textContent.length > distance ? distance : cursor.previousSibling.textContent.length;
        if (distance > 0) {
            cursor.firstChild.textContent = cursor.previousSibling.textContent.slice(-distance) + cursor.firstChild.textContent;
            cursor.nextSibling.textContent = cursor.firstChild.textContent.slice(-distance) + cursor.nextSibling.textContent;
            cursor.previousSibling.textContent = cursor.previousSibling.textContent.slice(0, -distance);
            cursor.firstChild.textContent = cursor.firstChild.textContent.slice(0, -distance)
        }
    };


    const moveCursorToLine = (node) => {
        const cursor = document.getElementById("cursor")
        var pos = cursor.previousSibling.textContent.length;
        const len = cursor.firstChild.textContent.length;

        if (!cursor.newline) {
            cursor.previousSibling.textContent += cursor.firstChild.textContent + cursor.nextSibling.textContent;
        }
        cursor.newline = false;
        cursor.nextSibling.remove();

        node.appendChild(cursor);
        if (node.firstChild.textContent.length > 0) {
            pos = node.firstChild.textContent.length > pos ? pos : node.firstChild.textContent.length - 1;
            cursor.firstChild.textContent = node.firstChild.textContent.slice(pos, pos+len);
            node.appendChild(document.createTextNode(node.firstChild.textContent.slice(pos+len)));
            node.firstChild.textContent = node.firstChild.textContent.slice(0, pos);
        } else {
            cursor.firstChild.textContent = " ";
            cursor.newline = true;
            node.appendChild(document.createTextNode(""));
        }
    }

    const upMove = () => {
        const cursor = document.getElementById("cursor")
        const prevLine = cursor.parentNode.previousElementSibling
        if (prevLine != null) {
            moveCursorToLine(prevLine);
        }
    };

    const downMove = () => {
        const cursor = document.getElementById("cursor")
        const nextLine = cursor.parentNode.nextElementSibling
        if (nextLine != null) {
            moveCursorToLine(nextLine);
        }
    };

    const leftAbsorbe = (size = 1, once = false) => {
        const cursor = document.getElementById("cursor")
        size = cursor.previousSibling.textContent.length >= size ? size : cursor.previousSibling.textContent.length;
        if (size > 0) {
            cursor.firstChild.textContent = cursor.previousSibling.textContent.slice(-size).slice(0, 1);
            cursor.previousSibling.textContent = cursor.previousSibling.textContent.slice(0, -size);
        } else if (!once) {
            rightAbsorbe(1, true);
        } else {
            cursor.firstChild.textContent = " ";
            cursor.newline = true;
        }
    }

    const rightAbsorbe = (size = 1, once = false) => {
        const cursor = document.getElementById("cursor")
        size = cursor.nextSibling.textContent.length >= size ? size : cursor.nextSibling.textContent.length;
        if (size > 0) {
            cursor.firstChild.textContent = cursor.nextSibling.textContent.slice(size-1, size);
            cursor.nextSibling.textContent = cursor.nextSibling.textContent.slice(size);
        } else if (!once) {
            leftAbsorbe(1, true);
        } else {
            cursor.firstChild.textContent = " ";
            cursor.newline = true;
        }
    }

    const MODE_NORMAL = 0;
    const MODE_INSERT = 1;

    var mode = MODE_NORMAL;
    var repeat = 0;

    const changeMode = (newMode) => {
        if (newMode === mode) {
        } else if (newMode === MODE_NORMAL) {
            mode = MODE_NORMAL;

            const cursor = document.getElementById("cursor")
            cursor.className = "block";

            leftAbsorbe();
        } else if (newMode === MODE_INSERT) {
            mode = MODE_INSERT;

            const cursor = document.getElementById("cursor")
            cursor.className = "bar";

            if (!cursor.newline) {
                cursor.nextSibling.textContent = cursor.firstChild.textContent + cursor.nextSibling.textContent;
            }
            cursor.newline = false;
            cursor.firstChild.textContent = "";
        }
    }

    el.addEventListener('keydown', e => {
        e.preventDefault();
        if (mode === MODE_INSERT) {
            switch (e.key) {
                case "Escape":
                    changeMode(MODE_NORMAL);
                    break;
                case "ArrowRight":
                    rightMove();
                    break;
                case "ArrowLeft":
                    leftMove();
                    break;
                case "ArrowUp":
                    upMove();
                    break;
                case "ArrowDown":
                    downMove();
                    break;
                default:
                    break;
            }
            if (e.key.length == 1) {
                document.getElementById("cursor").previousSibling.textContent += e.key;
            }
        } else if (mode === MODE_NORMAL) {
            var number = false;
            switch (e.key) {
                case "l":
                    rightMove(repeat > 0 ? repeat : 1);
                    break;
                case "h":
                    leftMove(repeat > 0 ? repeat : 1);
                    break;
                case "k":
                    upMove(repeat > 0 ? repeat : 1);
                    break;
                case "j":
                    downMove(repeat > 0 ? repeat : 1);
                    break;
                case "i":
                    changeMode(MODE_INSERT);
                    break;
                case "a":
                    changeMode(MODE_INSERT);
                    rightMove();
                    break;
                case "x":
                    rightAbsorbe(repeat > 0 ? repeat : 1);
                    break;
                case "0":
                    leftMove(document.getElementById("cursor").previousSibling.textContent.length);
                    break;
                case "$":
                    rightMove(document.getElementById("cursor").nextSibling.textContent.length);
                    break;
                case "1": case "2": case "3": case "4": case "5": case "6": case "7": case "8": case "9":
                    repeat = repeat*10 + parseInt(e.key);
                    number = true;
                    break;
                default:
                    break;
            }
            if (number == false) {
                repeat = 0;
            }
        }
    });
};

// Turn div into an editor
const el = document.querySelector('.editor');
el.focus();
editor(el);

