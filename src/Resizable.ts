import { Div } from "./Element.ts";

class Coordinate {
	readonly max: null | number;
	readonly min: null | number;
	val: number = 0;

	constructor(min: null | number = null, max: null | number = null) {
		this.max = max;
		this.min = min;
	}

	clamp(val: number): number {
		if (this.max !== null && val > this.max) return this.max;

		if (this.min !== null && val < this.min) return this.min;

		return val;
	}

	add(val: number): number {
		return this.clamp(this.val + val);
	}

	adddiff(val: number): number {
		return this.add(val) - this.val;
	}

	subdiff(val: number): number {
		return this.sub(val) - this.val;
	}

	sub(val: number): number {
		return this.clamp(this.val - val);
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

export class Resizable extends Div {
	left: Coordinate;
	top: Coordinate;
	height: Coordinate;
	width: Coordinate;
	x: Coordinate;
	y: Coordinate;

	resizers: Resizers;

	last_cb: null | ((e: MouseEvent) => void) = null;

	constructor(parent: HTMLDivElement) {
		super("", parent);

		this.left = new Coordinate(0);
		this.top = new Coordinate(0);
		this.height = new Coordinate(200);
		this.width = new Coordinate(200);
		this.x = new Coordinate();
		this.y = new Coordinate();

		this.resizers = this.appendChild(new Resizers());
	}

	enable() {
		this.node.style.left = this.node.getBoundingClientRect().left + "px";
		this.node.style.top = this.node.getBoundingClientRect().top + "px";
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

	installEventListener(
		div: Div,
		f: (t: Resizable, x: number, y: number) => void,
	) {
		div.node.addEventListener("mousedown", (e: MouseEvent) => {
			e.preventDefault();
			this.start(e.pageX, e.pageY);
			this.last_cb = (e: MouseEvent) => {
				f(this, e.pageX - this.x.get(), e.pageY - this.y.get());
			};
			globalThis.addEventListener("mousemove", this.last_cb);
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

		this.x.set(x);
		this.y.set(y);
	}

	stop() {
		if (this.last_cb !== null) {
			globalThis.removeEventListener("mousemove", this.last_cb);
			this.last_cb = null;
		}
	}

	static resizeBottomRight(t: Resizable, dx: number, dy: number) {
		t.node.style.width = t.width.add(dx) + "px";
		t.node.style.height = t.height.add(dy) + "px";
	}

	static resizeBottomLeft(t: Resizable, dx: number, dy: number) {
		t.node.style.left = t.left.sub(t.width.subdiff(dx)) + "px";
		t.node.style.width =
			t.width.sub(t.left.subdiff(t.width.subdiff(dx))) + "px";

		t.node.style.height = t.height.add(dy) + "px";
	}

	static resizeTopRight(t: Resizable, dx: number, dy: number) {
		t.node.style.width = t.width.add(dx) + "px";
		t.node.style.height =
			t.height.sub(t.top.subdiff(t.height.subdiff(dy))) + "px";
		t.node.style.top = t.top.sub(t.height.subdiff(dy)) + "px";
	}

	static resizeTopLeft(t: Resizable, dx: number, dy: number) {
		t.node.style.width =
			t.width.sub(t.left.subdiff(t.width.subdiff(dx))) + "px";
		t.node.style.height =
			t.height.sub(t.top.subdiff(t.height.subdiff(dy))) + "px";
		t.node.style.top = t.top.sub(t.height.subdiff(dy)) + "px";
		t.node.style.left = t.left.sub(t.width.subdiff(dx)) + "px";
	}
}
