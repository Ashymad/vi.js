export const editor = (el) => {
	const MODE_NORMAL = 0;
	const MODE_INSERT = 1;
	const MAX_LINES = 15;
	const min = Math.min;

	let spaceLeft = 0;
	let count = 0;

	const cursor = document.getElementById("cursor");
	cursor.mode = MODE_NORMAL;

	el.addEventListener("keydown", (e) => {
		e.preventDefault();
		if (cursor.mode === MODE_INSERT) {
			switch (e.key) {
				case "Escape":
					changeMode(MODE_NORMAL);
					if (isCursorInStatus()) {
						moveCursorToLine();
						setStatus("");
					}
					break;
				case "ArrowRight":
					rightMove();
					break;
				case "ArrowLeft":
					if (!isCursorInStatus() || !(leftLength() === 1)) leftMove();
					break;
				case "ArrowUp":
					upMove();
					break;
				case "ArrowDown":
					downMove();
					break;
				case "Backspace":
					if (leftLength() > 0) leftDelete();
					if (isCursorInStatus() && leftLength() === 0) {
						changeMode(MODE_NORMAL);
						moveCursorToLine();
					}
					break;
				case "Enter":
					if (isCursorInStatus()) {
						const status = document.getElementById("status").firstChild;
						changeMode(MODE_NORMAL);
						moveCursorToLine();
						executeCommand(status.textContent.slice(1));
					} else {
						moveCursorToLine(insertNewLine());
					}
					break;
				case "Tab":
					leftInput("    ");
					break;
				default:
					break;
			}
			if (e.key.length == 1) {
				leftInput(e.key);
			}
		} else if (cursor.mode === MODE_NORMAL) {
			let number = false;
			switch (e.key) {
				case "l":
					rightMove(count > 0 ? count : 1);
					break;
				case "Backspace":
				case "h":
					leftMove(count > 0 ? count : 1);
					break;
				case "k":
					upMove(count > 0 ? count : 1);
					break;
				case "j":
					downMove(count > 0 ? count : 1);
					break;
				case "I":
					leftMove(leftLength());
				/* falls through */
				case "i":
					changeMode(MODE_INSERT);
					break;
				case "A":
					rightMove(rightLength());
				/* falls through */
				case "a":
					changeMode(MODE_INSERT);
					rightMove();
					break;
				case "x":
					rightDelete(count > 0 ? count : 1, true);
					break;
				case "0":
					leftMove(leftLength());
					break;
				case "$":
					rightMove(rightLength());
					break;
				case "o":
					moveCursorToLine(insertNewLine());
					changeMode(MODE_INSERT);
					break;
				case "O":
					moveCursorToLine(insertNewLine(true));
					changeMode(MODE_INSERT);
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
					count = count * 10 + parseInt(e.key);
					number = true;
					break;
				case ":":
					moveCursorToStatus();
					break;
				case "Shift":
				case "Control":
				case "Alt":
				case "Meta":
					break;
				default:
					setStatus("Unbound key: " + e.key);
					break;
			}
			if (number == false) {
				count = 0;
			}
		}
	});

	const rightMove = (distance = 1) => {
		const cursor = document.getElementById("cursor");
		const next = cursor.nextSibling;
		const prev = cursor.previousSibling;
		const text = cursor.firstChild;

		if (next != null) {
			distance = min(next.textContent.length, distance);
			if (distance > 0) {
				text.textContent += next.textContent.slice(0, distance);
				if (prev === null) cursor.before(text.textContent.slice(0, distance));
				else prev.textContent += text.textContent.slice(0, distance);
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
				if (next === null) cursor.after(text.textContent.slice(-distance));
				else
					next.textContent =
						text.textContent.slice(-distance) + next.textContent;
				prev.textContent = prev.textContent.slice(0, -distance);
				text.textContent = text.textContent.slice(0, -distance);
			}
		}
	};

	const lengthCursor = () => {
		return document.getElementById("cursor").firstChild.textContent.length;
	};

	const isCursorInStatus = () => {
		return document.getElementById("cursor").parentNode.id == "status";
	};

	const moveCursorToStatus = () => {
		const status = document.getElementById("status");
		const cursor = document.getElementById("cursor");

		status.firstChild.textContent = ":";
		cursor.lastPos = leftLength();
		cursor.lastNode = cursor.parentNode;
		cursor.lastLen = cursor.firstChild.textContent.length;
		changeMode(MODE_INSERT);
		moveCursorToLine(status, 1);
	};

	const moveCursorToLine = (
		node = null,
		pos = leftLength(),
		len = lengthCursor(),
	) => {
		const cursor = document.getElementById("cursor");
		const next = cursor.nextSibling;
		let prev = cursor.previousSibling;
		const text = cursor.firstChild;

		if (isCursorInStatus()) {
			node = cursor.lastNode;
			pos = cursor.lastPos;
			len = cursor.lastLen;
		}

		if (node === null) return;

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
		} else {
			text.textContent = "";
		}
		cursor.newline = false;

		node.appendChild(cursor);
		prev = cursor.previousSibling;
		if (prev != null && prev.textContent.length > 0) {
			pos = min(pos, prev.textContent.length - len);
			if (len > 0) {
				text.textContent = prev.textContent.slice(pos, pos + len);
				cursor.after(prev.textContent.slice(pos + len));
			}
			prev.textContent = prev.textContent.slice(0, pos);
		} else if (len > 0) {
			text.textContent = "⏎";
			cursor.newline = true;
		}
	};

	const upScroll = (distance = 1) => {
		let first = firstVisibleLine().previousElementSibling;
		let last = lastVisibleLine();

		while (--distance >= 0 && first != null) {
			let overflow = overflowLines(first) + spaceLeft;
			while (overflow > 0) {
				overflow -= overflowLines(last);
				last.className = "invisible";
				last = last.previousElementSibling;
			}
			first.className = "";
			first = first.previousElementSibling;
			while (first != null && overflow + overflowLines(first) <= 0) {
				overflow += overflowLines(first);
				first.className = "";
				first = first.previousElementSibling;
			}
			spaceLeft = overflow;
		}
	};

	const downScroll = (distance = 1) => {
		let first = firstVisibleLine();
		let last = lastVisibleLine().nextElementSibling;

		while (--distance >= 0 && last != null) {
			let overflow = overflowLines(last) + spaceLeft;
			while (overflow > 0) {
				overflow -= overflowLines(first);
				first.className = "invisible";
				first = first.nextElementSibling;
			}
			last.className = "";
			last = last.nextElementSibling;
			while (last != null && overflow + overflowLines(last) <= 0) {
				overflow += overflowLines(last);
				last.className = "";
				last = last.nextElementSibling;
			}
			spaceLeft = overflow;
		}
	};

	const upMove = (distance = 1) => {
		const cursor = document.getElementById("cursor");
		let prevLine = cursor.parentNode.previousElementSibling;

		if (prevLine != null) {
			const scrollBy = distance;
			while (--distance > 0 && prevLine.previousElementSibling != null)
				prevLine = prevLine.previousElementSibling;

			if (prevLine.className == "invisible") upScroll(scrollBy);

			moveCursorToLine(prevLine);
		}
	};

	const downMove = (distance = 1) => {
		const cursor = document.getElementById("cursor");
		let nextLine = cursor.parentNode.nextElementSibling;
		if (nextLine != null) {
			const scrollBy = distance;
			while (--distance > 0 && nextLine.nextElementSibling != null)
				nextLine = nextLine.nextElementSibling;

			if (nextLine.className == "invisible") downScroll(scrollBy);

			moveCursorToLine(nextLine);
		}
	};

	const overflowLines = (line) => {
		const style = globalThis
			.getComputedStyle(line, null)
			.getPropertyValue("line-height");
		const lineHeight = parseFloat(style);

		return Math.round(line.scrollHeight / lineHeight);
	};

	const leftDelete = (size = 1, eat = false, once = false) => {
		const cursor = document.getElementById("cursor");
		const prev = cursor.previousSibling;
		const text = cursor.firstChild;

		size = prev == null ? 0 : min(prev.textContent.length, size);

		if (size > 0) {
			const linesBefore = overflowLines(cursor.parentNode);

			if (eat) text.textContent = prev.textContent.slice(-size).slice(0, 1);
			prev.textContent = prev.textContent.slice(0, -size);

			const linesAfter = overflowLines(cursor.parentNode);
			showUnderflowingLines(linesBefore - linesAfter);
		} else if (!once) {
			rightDelete(1, eat, true);
		} else {
			text.textContent = "⏎";
			cursor.newline = true;
		}
	};

	const rightDelete = (size = 1, eat = false, once = false) => {
		const cursor = document.getElementById("cursor");
		const next = cursor.nextSibling;
		const text = cursor.firstChild;

		size = next == null ? 0 : min(next.textContent.length, size);

		if (size > 0) {
			const linesBefore = overflowLines(cursor.parentNode);

			if (eat) text.textContent = next.textContent.slice(size - 1, size);
			next.textContent = next.textContent.slice(size);

			const linesAfter = overflowLines(cursor.parentNode);
			showUnderflowingLines(linesBefore - linesAfter);
		} else if (!once) {
			leftDelete(1, eat, true);
		} else {
			cursor.firstChild.textContent = "⏎";
			cursor.newline = true;
		}
	};

	const hideOverflowingLines = (lines = 1) => {
		const pane = document.getElementById("cursor").parentNode.parentNode;

		if (pane.childElementCount + lines > MAX_LINES) {
			let last = lastVisibleLine();
			while (--lines >= 0 && last != null) {
				last.className = "invisible";
				last = last.nextElementSibling;
			}
		}
	};

	const showUnderflowingLines = (lines = 1) => {
		let last = lastVisibleLine().nextElementSibling;
		while (--lines >= 0 && last != null) {
			last.className = "";
			last = last.nextElementSibling;
		}
	};

	const leftInput = (text) => {
		const cursor = document.getElementById("cursor");
		const prev = cursor.previousSibling;

		const linesBefore = overflowLines(cursor.parentNode);

		if (prev === null) cursor.before(text);
		else prev.textContent += text;

		const linesAfter = overflowLines(cursor.parentNode);

		hideOverflowingLines(linesAfter - linesBefore);
	};

	const rightInput = (text) => {
		const cursor = document.getElementById("cursor");
		const next = cursor.nextSibling;

		const linesBefore = overflowLines(cursor.parentNode);

		if (next === null) cursor.after(text);
		else next.textContent = text + next.textContent;

		const linesAfter = overflowLines(cursor.parentNode);

		hideOverflowingLines(linesAfter - linesBefore);
	};

	const leftLength = () => {
		const prev = document.getElementById("cursor").previousSibling;
		return prev === null ? 0 : prev.textContent.length;
	};

	const rightLength = () => {
		const next = document.getElementById("cursor").nextSibling;
		return next === null ? 0 : next.textContent.length;
	};

	const lastVisibleLine = () => {
		let line = document.getElementById("cursor").parentNode;
		while (
			line.nextElementSibling != null &&
			line.nextElementSibling.className != "invisible"
		)
			line = line.nextElementSibling;

		return line;
	};

	const firstVisibleLine = () => {
		let line = document.getElementById("cursor").parentNode;
		while (
			line.previousElementSibling != null &&
			line.previousElementSibling.className != "invisible"
		)
			line = line.previousElementSibling;

		return line;
	};

	const insertNewLine = (before = false) => {
		const newLine = document.createElement("div");
		const line = document.getElementById("cursor").parentNode;
		const pane = line.parentNode;

		if (pane.childElementCount >= MAX_LINES) {
			if (
				line.nextElementSibling === null ||
				line.nextElementSibling.className === "invisible"
			) {
				if (!before) {
					firstVisibleLine().className = "invisible";
				} else {
					newLine.className = "invisible";
				}
			} else {
				lastVisibleLine().className = "invisible";
			}
		}

		if (before) line.before(newLine);
		else line.after(newLine);

		return newLine;
	};

	const changeMode = (newMode) => {
		const cursor = document.getElementById("cursor");
		const text = cursor.firstChild;

		if (newMode === cursor.mode) {
			// Do nothing
		} else if (newMode === MODE_NORMAL) {
			cursor.mode = MODE_NORMAL;
			cursor.className = "block";

			leftDelete(1, true);
		} else if (newMode === MODE_INSERT) {
			cursor.mode = MODE_INSERT;
			cursor.className = "bar";
			if (!cursor.newline) {
				rightInput(text.textContent);
			}
			cursor.newline = false;
			text.textContent = "";
		}
	};

	const setStatus = (text) => {
		document.getElementById("status").firstChild.textContent = text;
	};

	const executeCommand = (command) => {
		if (command.length === 0) {
			setStatus("");
			return;
		}

		const argv = command.split(" ");
		switch (argv[0]) {
			case "q":
				setStatus(
					"File modified since last complete write; write or use ! to override.",
				);
				break;
			case "q!":
				document.getElementById("console-app-container").style.display = "none";
				break;
			case "hello":
			case "Hello":
				setStatus("Nice to meet you :)");
				break;
			default:
				setStatus("The " + argv[0] + " command is unknown.");
				break;
		}
	};
};
