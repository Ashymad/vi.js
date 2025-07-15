export class Element<Type extends HTMLElement> {
	node: Type;

	constructor(node: Type, cls: string) {
		this.node = node;
		if (cls.length > 0) this.node.className = cls;
	}

	appendChild<U extends HTMLElement, T extends Element<U>>(node: T): T {
		this.node.appendChild(node.node);
		return node;
	}

	appendTo<U extends HTMLElement>(node: U): U {
		node.appendChild(this.node);
		return node;
	}

	insertChild<U extends HTMLElement, T extends Element<U>>(
		index: number,
		node: T,
	): T {
		if (this.node.children.length > index)
			this.node.insertBefore(node.node, this.node.children[index]);
		else this.appendChild(node);
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

	lineHeight(): number {
		return parseFloat(
			globalThis
				.getComputedStyle(this.node, null)
				.getPropertyValue("line-height"),
		);
	}

	clientHeight(): number {
		return Math.floor(this.node.clientHeight / this.lineHeight());
	}

	scrollHeight(): number {
		return Math.floor(this.node.scrollHeight / this.lineHeight());
	}
}

export class Div extends Element<HTMLDivElement> {
	constructor(
		cls: string = "",
		el: HTMLDivElement = document.createElement("div"),
	) {
		super(el, cls);
	}
}

export class Span extends Element<HTMLSpanElement> {
	constructor(
		cls: string = "",
		el: HTMLSpanElement = document.createElement("span"),
	) {
		super(el, cls);
	}
}
