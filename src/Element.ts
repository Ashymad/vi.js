class Element<Type extends HTMLElement> {
	node: Type;

	constructor(node: Type, cls: string) {
		this.node = node;
		this.node.className = cls;
	}

	appendChild<U extends HTMLElement, T extends Element<U>>(node: T): T {
		this.node.appendChild(node.node);
		return node;
	}

	appendText(text: string): Text {
		const txt = document.createTextNode(text);
		this.node.appendChild(txt);
		return txt;
	}

	replaceFirstChild<U extends HTMLElement, T extends Element<U>>(child: T): T {
		if (this.node.firstChild === null) {
			this.appendChild(child);
		} else {
			this.node.replaceChild(child.node, this.node.firstChild);
		}
		return child;
	}

	removeLastChild(): void {
		if (this.node.lastChild !== null)
			this.node.removeChild(this.node.lastChild);
	}
}

export class Div extends Element<HTMLDivElement> {
	constructor(cls: string = "") {
		super(document.createElement("div"), cls);
	}
}

export class Span extends Element<HTMLSpanElement> {
	constructor(cls: string = "") {
		super(document.createElement("span"), cls);
	}
}
