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
        this.v = 0;
        this.headingV = 0;
        this.a = 0;
        this.headingA = 0;
        this.maxV = 0;
        this.maxHeadingV = 0;
        this.frictionA = 50;
        this.frictionHeadingA = 5;
        this.brakeFrictionA = 90; // this should be a control, but for rn lets put it as constant
        this.braking = false;
    }
    getFrictionHeadingA() {
        return this.frictionHeadingA;
    }
    setHeadingV(v) {
        this.headingV = v;
    }
    getHeading() {
        return this.heading;
    }
    getHeadingV() {
        return this.headingV;
    }
    getBrakeFrictionA() {
        return this.brakeFrictionA;
    }
    setDeltaTime(deltaTime) {
        this.deltaTime = deltaTime;
    }
    setBrake(state) {
        this.braking = state;
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
    getV() {
        return this.v;
    }
    move() {
        this.x += this.v * Math.cos(this.heading - Math.PI / 2) * this.deltaTime;
        this.y += this.v * Math.sin(this.heading - Math.PI / 2) * this.deltaTime;
        this.heading += this.headingV * this.deltaTime;
        if (this.braking) {
            const sign = Math.sign(this.v);
            this.v -= sign * this.brakeFrictionA;
            if (this.v * sign < 0) {
                this.v = 0;
            }
        }
        else if (this.a === 0 && this.v !== 0) { // object slowing down from rolling friction
            const oldSign = Math.sign(this.v);
            this.v -= this.frictionA;
            if (Math.sign(this.v) * oldSign < 0) {
                this.v = 0;
            }
        }
        if (this.headingA === 0 && this.headingV !== 0) { // obj heading stoping from kinetic friction
            const sign = Math.sign(this.headingV);
            this.headingV -= sign * this.frictionHeadingA;
            if (this.headingV * sign < 0) {
                this.headingV = 0;
            }
        }
        this.v += this.a * this.deltaTime;
        this.headingV += this.headingA * this.deltaTime;
        if (this.v >= this.maxV) {
            this.v = this.maxV;
        }
        if (Math.abs(this.headingV) >= this.maxHeadingV) {
            this.headingV = Math.sign(this.headingV) * this.maxHeadingV;
        }
    }
    // do i need a prerender method? if i do put it in here
    render() {
        if (this.color === "")
            throw new Error("no color given");
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
