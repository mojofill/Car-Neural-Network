"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RenderedObject {
    constructor(ctx) {
        this.ctx = ctx;
        this.deltaTime = 0;
        this.color = "";
        this.x = 0; // center x
        this.y = 0; // center y
        this.heading = 0;
        this.width = 0;
        this.height = 0;
        this.v = 100;
        this.headingV = 0;
        this.a = 0;
        this.headingA = 0;
        this.maxV = 0;
        this.maxHeadingV = 0;
        this.hidden = false;
        this.isHiding = false;
    }
    setHeadingV(v) {
        this.headingV = v;
    }
    setDeltaTime(deltaTime) {
        this.deltaTime = deltaTime;
    }
    setPose(x, y, heading) {
        this.x = x;
        this.y = y;
        this.heading = heading;
    }
    setDimensions(w, h) {
        this.width = w;
        this.height = h;
    }
    setColor(c) {
        this.color = c;
    }
    setMaxVelocity(v) {
        this.maxV = v;
    }
    setMaxHeadingVelocity(v) {
        this.maxHeadingV = v;
    }
    setA(a) {
        this.a = a;
    }
    setHeadingA(a) {
        this.headingA = a;
    }
    wait() {
        this.isHiding = true;
    }
    start() {
        this.isHiding = false;
    }
    move() {
        if (this.isHiding)
            return;
        this.x += this.v * Math.cos(this.heading - Math.PI / 2) * this.deltaTime;
        this.y += this.v * Math.sin(this.heading - Math.PI / 2) * this.deltaTime;
        this.heading += this.headingV * this.deltaTime;
        this.v += this.a * this.deltaTime;
        this.headingV += this.headingA * this.deltaTime;
        if (Math.abs(this.v) >= this.maxV) {
            this.v = Math.sign(this.v) * this.maxV;
        }
        if (Math.abs(this.headingV) >= this.maxHeadingV) {
            this.headingV = Math.sign(this.headingV) * this.maxHeadingV;
        }
    }
    hide() {
        this.hidden = true;
    }
    show() {
        this.hidden = false;
    }
    render() {
        if (this.color === "")
            throw new Error("no color given");
        if (this.hidden)
            return;
        this.ctx.save();
        this.ctx.translate(this.x, this.y);
        this.ctx.rotate(this.heading);
        this.ctx.translate(-this.x, -this.y);
        this.ctx.fillStyle = this.color;
        this.ctx.fillRect(this.x - this.width / 2, this.y - this.height / 2, this.width, this.height);
        this.ctx.restore();
    }
}
exports.default = RenderedObject;
