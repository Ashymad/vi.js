import { Div } from "./Element.ts";

class Coordinate {
	max: null | number;
	min: null | number;
	val: number = 0;

	constructor(min: null | number = null, max: null | number = null) {
		this.max = max;
		this.min = min;
	}

	clamp(val: number, min = this.min, max = this.max): number {
		if (max !== null && val > max) return max;

		if (min !== null && val < min) return min;

		return val;
	}

	add(val: number, min = this.min, max = this.max): number {
		return this.clamp(this.val + val, min, max);
	}

	dadd(val: number, min = this.min, max = this.max): number {
		return this.add(val, min, max) - this.val;
	}

	dsub(val: number): number {
		return this.sub(val) - this.val;
	}

	sub(val: number): number {
		return this.clamp(this.val - val);
	}

	min0(): number {
		return this.min === null ? 0 : this.min;
	}

	set(val: number) {
		this.val = this.clamp(val);
	}

	get(): number {
		return this.val;
	}
}

class Resizers extends Div {
	top_left: Div;
	top_right: Div;
	bottom_left: Div;
	bottom_right: Div;

	constructor() {
		super("resizers");
		this.top_left = this.appendChild(new Div("resizer top-left"));
		this.top_right = this.appendChild(new Div("resizer top-right"));
		this.bottom_left = this.appendChild(new Div("resizer bottom-left"));
		this.bottom_right = this.appendChild(new Div("resizer bottom-right"));
	}
}

type Diff = { dx: number; dy: number };

export class Resizable extends Div {
	left: Coordinate;
	top: Coordinate;
	height: Coordinate;
	width: Coordinate;
	x: Coordinate;
	y: Coordinate;

	resizers: Resizers;

	cb: null | ((e: MouseEvent) => void) = null;
	resize_cb: null | (() => void) = null;

	constructor(parent: HTMLDivElement) {
		super("", parent);

		this.height = new Coordinate(200);
		this.width = new Coordinate(200);
		this.left = new Coordinate(0);
		this.top = new Coordinate(0);
		this.x = new Coordinate();
		this.y = new Coordinate();

		this.resizers = this.appendChild(new Resizers());
	}

	enable() {
		this.node.style.left = this.node.getBoundingClientRect().left + "px";
		this.node.style.top = this.node.getBoundingClientRect().top + "px";
		this.node.style.width = this.node.getBoundingClientRect().width + "px";
		this.node.style.height = this.node.getBoundingClientRect().height + "px";
		this.node.style.margin = "unset";

		this.installEventListener(this.resizers.top_left, Resizable.resizeTopLeft);
		this.installEventListener(
			this.resizers.top_right,
			Resizable.resizeTopRight,
		);
		this.installEventListener(
			this.resizers.bottom_left,
			Resizable.resizeBottomLeft,
		);
		this.installEventListener(
			this.resizers.bottom_right,
			Resizable.resizeBottomRight,
		);
	}

	atResize(f: () => void) {
		this.resize_cb = f;
	}

	addMovable(el: HTMLDivElement) {
		this.installEventListener(new Div("", el), Resizable.move);
	}

	installEventListener(
		div: Div,
		f: (t: Resizable, x: number, y: number) => void,
	) {
		div.node.addEventListener("mousedown", (e: MouseEvent) => {
			e.preventDefault();
			this.start(e.pageX, e.pageY);
			this.cb = (e: MouseEvent) => {
				f(this, e.pageX - this.x.get(), e.pageY - this.y.get());
			};
			globalThis.addEventListener("mousemove", this.cb);
			globalThis.addEventListener("mouseup", () => {
				this.stop();
			});
		});
	}

	start(x: number, y: number) {
		this.width.set(
			parseFloat(getComputedStyle(this.node, null).getPropertyValue("width")),
		);
		this.height.set(
			parseFloat(getComputedStyle(this.node, null).getPropertyValue("height")),
		);
		this.top.set(this.node.getBoundingClientRect().top);
		this.left.set(this.node.getBoundingClientRect().left);

		this.width.max = document.documentElement.clientWidth - this.left.min0();
		this.height.max = document.documentElement.clientHeight - this.top.min0();
		this.top.max = document.documentElement.clientHeight - this.height.min0();
		this.left.max = document.documentElement.clientWidth - this.width.min0();

		this.x.set(x);
		this.y.set(y);
	}

	stop() {
		if (this.cb !== null) {
			globalThis.removeEventListener("mousemove", this.cb);
			this.cb = null;
		}

		if (this.resize_cb !== null) this.resize_cb();

		this.width.max = null;
		this.height.max = null;
		this.top.max = null;
		this.left.max = null;
	}

	static resizeBottomRight = Resizable.resize;

	static resizeBottomLeft(t: Resizable, dx: number, dy: number) {
		const diff = t.move(-t.width.dsub(dx), 0, null);
		t.resize(-diff.dx, dy);
	}

	static resizeTopRight(t: Resizable, dx: number, dy: number) {
		const diff = t.move(0, -t.height.dsub(dy), null, null);
		t.resize(dx, -diff.dy);
	}

	static resizeTopLeft(t: Resizable, dx: number, dy: number) {
		const diff = t.move(-t.width.dsub(dx), -t.height.dsub(dy), null, null);
		t.resize(-diff.dx, -diff.dy);
	}

	static move(t: Resizable, dx: number, dy: number) {
		t.move(dx, dy);
	}

	maxWidth(): number {
		return (
			document.documentElement.clientWidth - parseFloat(this.node.style.left)
		);
	}

	maxHeight(): number {
		return (
			document.documentElement.clientHeight - parseFloat(this.node.style.top)
		);
	}

	maxTop(): number {
		return (
			document.documentElement.clientHeight - parseFloat(this.node.style.height)
		);
	}

	maxLeft(): number {
		return (
			document.documentElement.clientWidth - parseFloat(this.node.style.width)
		);
	}

	move(
		dx: number,
		dy: number,
		maxX: number | null = this.maxLeft(),
		maxY: number | null = this.maxTop(),
	): Diff {
		const dleft = this.left.dadd(dx, this.left.min, maxX);
		const dtop = this.top.dadd(dy, this.top.min, maxY);

		this.node.style.left = this.left.add(dleft) + "px";
		this.node.style.top = this.top.add(dtop) + "px";

		return { dx: dleft, dy: dtop };
	}

	static resize(t: Resizable, dx: number, dy: number) {
		t.resize(dx, dy);
	}

	resize(
		dx: number,
		dy: number,
		maxX: number | null = this.maxWidth(),
		maxY: number | null = this.maxHeight(),
	): Diff {
		const dwidth = this.width.dadd(dx, this.width.min, maxX);
		const dheight = this.height.dadd(dy, this.height.min, maxY);

		this.node.style.height = this.height.add(dheight) + "px";
		this.node.style.width = this.width.add(dwidth) + "px";

		if (this.resize_cb !== null) this.resize_cb();
		return { dx: dwidth, dy: dheight };
	}
}
