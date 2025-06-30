// Syntax highlight for JS
const editor = (el) => {
	const min = Math.min;

	const rightMove = (distance = 1) => {
		const cursor = document.getElementById("cursor");
		const next = cursor.nextSibling;
		const prev = cursor.previousSibling;
		const text = cursor.firstChild;

        if (next != null) {
            distance = min(next.textContent.length, distance);
            if (distance > 0) {
                text.textContent += next.textContent.slice(0, distance);
                if (prev === null)
                    cursor.before(text.textContent.slice(0, distance));
                else
                    prev.textContent += text.textContent.slice(0, distance);
                next.textContent = next.textContent.slice(distance);
                text.textContent = text.textContent.slice(distance);
            }
        }
	};

	const leftMove = (distance = 1) => {
		const cursor = document.getElementById("cursor");
		const next = cursor.nextSibling;
		const prev = cursor.previousSibling;
		const text = cursor.firstChild;

        if (prev != null) {
            distance = min(prev.textContent.length, distance);
            if (distance > 0) {
                text.textContent = prev.textContent.slice(-distance) + text.textContent;
                if (next === null)
                    cursor.after(text.textContent.slice(-distance));
                else 
                    next.textContent = text.textContent.slice(-distance) + next.textContent;
                prev.textContent = prev.textContent.slice(0, -distance);
                text.textContent = text.textContent.slice(0, -distance);
            }
		}
	};

	const moveCursorToLine = (node) => {
		const cursor = document.getElementById("cursor");
		const next = cursor.nextSibling;
		let prev = cursor.previousSibling;
		const text = cursor.firstChild;
		const len = text.textContent.length;
		let pos = prev != null ? prev.textContent.length : 0;

		if (!cursor.newline) {
            if (next === null && prev === null) {
                cursor.before(text.textContent);
            } else if (prev === null) {
                next.textContent = text.textContent + next.textContent;
            } else if (next === null) {
                prev.textContent += text.textContent;
            } else {
                prev.textContent += text.textContent + next.textContent;
                next.remove();
            }
		}
		cursor.newline = false;

		node.appendChild(cursor);
        prev = node.firstChild;
		if (prev != cursor && prev.textContent.length > 0) {
			pos = min(pos, prev.textContent.length - 1);
			text.textContent = prev.textContent.slice(pos, pos + len);
            cursor.after(prev.textContent.slice(pos + len));
			prev.textContent = prev.textContent.slice(0, pos);
		} else {
			text.textContent = " ";
			cursor.newline = true;
		}
	};

	const upMove = () => {
		const cursor = document.getElementById("cursor");
		const prevLine = cursor.parentNode.previousElementSibling;
		if (prevLine != null) {
			moveCursorToLine(prevLine);
		}
	};

	const downMove = () => {
		const cursor = document.getElementById("cursor");
		const nextLine = cursor.parentNode.nextElementSibling;
		if (nextLine != null) {
			moveCursorToLine(nextLine);
		}
	};

	const leftAbsorbe = (size = 1, once = false) => {
		const cursor = document.getElementById("cursor");
		size =
			cursor.previousSibling.textContent.length >= size
				? size
				: cursor.previousSibling.textContent.length;
		if (size > 0) {
			cursor.firstChild.textContent = cursor.previousSibling.textContent
				.slice(-size)
				.slice(0, 1);
			cursor.previousSibling.textContent =
				cursor.previousSibling.textContent.slice(0, -size);
		} else if (!once) {
			rightAbsorbe(1, true);
		} else {
			cursor.firstChild.textContent = " ";
			cursor.newline = true;
		}
	};

	const rightAbsorbe = (size = 1, once = false) => {
		const cursor = document.getElementById("cursor");
		size =
			cursor.nextSibling.textContent.length >= size
				? size
				: cursor.nextSibling.textContent.length;
		if (size > 0) {
			cursor.firstChild.textContent = cursor.nextSibling.textContent.slice(
				size - 1,
				size,
			);
			cursor.nextSibling.textContent =
				cursor.nextSibling.textContent.slice(size);
		} else if (!once) {
			leftAbsorbe(1, true);
		} else {
			cursor.firstChild.textContent = " ";
			cursor.newline = true;
		}
	};

	const MODE_NORMAL = 0;
	const MODE_INSERT = 1;

	let mode = MODE_NORMAL;
	let repeat = 0;

	const changeMode = (newMode) => {
		if (newMode === mode) {
			// Do nothing
		} else if (newMode === MODE_NORMAL) {
			mode = MODE_NORMAL;

			const cursor = document.getElementById("cursor");
			cursor.className = "block";

			leftAbsorbe();
		} else if (newMode === MODE_INSERT) {
			mode = MODE_INSERT;

			const cursor = document.getElementById("cursor");
			cursor.className = "bar";

			if (!cursor.newline) {
				cursor.nextSibling.textContent =
					cursor.firstChild.textContent + cursor.nextSibling.textContent;
			}
			cursor.newline = false;
			cursor.firstChild.textContent = "";
		}
	};

	el.addEventListener("keydown", (e) => {
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
			let number = false;
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
					leftMove(
						document.getElementById("cursor").previousSibling.textContent
							.length,
					);
					break;
				case "$":
					rightMove(
						document.getElementById("cursor").nextSibling.textContent.length,
					);
					break;
				case "1":
				case "2":
				case "3":
				case "4":
				case "5":
				case "6":
				case "7":
				case "8":
				case "9":
					repeat = repeat * 10 + parseInt(e.key);
					number = true;
					break;
				default:
                    document.getElementById("status").firstChild.textContent = "Error: Unbound key: " + e.key;
					break;
			}
			if (number == false) {
				repeat = 0;
			}
		}
	});
};

// Turn div into an editor
const el = document.querySelector(".editor");
el.focus();
editor(el);
