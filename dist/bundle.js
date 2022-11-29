(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const renderedObj_1 = __importDefault(require("./renderedObj"));
/*
todo:
build a simple control system
*/
const color = "red";
const startingX = 0;
const startingY = 0;
const startingHeading = 0;
const width = 10;
const height = 20;
const maxV = 200;
const maxHeadingV = 3.5;
class Car extends renderedObj_1.default {
    constructor(ctx) {
        super(ctx);
        this.setPose(startingX, startingY, startingHeading);
        this.setDimensions(width, height);
        this.setColor(color);
        this.setMaxVelocity(maxV);
        this.setMaxHeadingVelocity(maxHeadingV);
    }
}
exports.default = Car;

},{"./renderedObj":4}],2:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const car_1 = __importDefault(require("./car"));
const path_1 = __importDefault(require("./path"));
const canvas = document.getElementById("canvas");
if (!canvas || !(canvas instanceof HTMLCanvasElement))
    throw new Error("canvas does not exist");
const ctx = canvas.getContext('2d');
if (!ctx || !(ctx instanceof CanvasRenderingContext2D))
    throw new Error('idek how this will ever happen but typescript is stupid sometimes so i gotta do this');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.width = '' + canvas.width;
canvas.style.height = '' + canvas.height;
canvas.style.position = 'fixed';
canvas.style.margin = canvas.style.left = canvas.style.top = '0px';
const pixelMap = [];
const pixelWidth = 10;
const time = {
    curr: Date.now() / 1000,
    past: Date.now() / 1000,
    updateTime() {
        this.past = this.curr;
        this.curr = Date.now() / 1000;
    },
    get delatTime() {
        return this.curr - this.past;
    }
};
let path;
const car = new car_1.default(ctx);
const keys = {
    forward: false,
    back: false,
    left: false,
    right: false
};
const init = () => {
    car.setA(0);
    car.setPose(canvas.width / 2, canvas.height / 2, car.getHeading());
    document.addEventListener('keydown', (e) => {
        switch (e.code) {
            case "KeyW":
            case "ArrowUp":
                e.preventDefault();
                keys.forward = true;
                break;
            case "KeyS":
            case "ArrowDown":
                e.preventDefault();
                keys.back = true;
                break;
            case "ArrowLeft":
            case "KeyA":
                e.preventDefault();
                keys.left = true;
                break;
            case "ArrowRight":
            case "KeyD":
                e.preventDefault();
                keys.right = true;
                break;
        }
    });
    document.addEventListener('keyup', (e) => {
        switch (e.code) {
            case "KeyW":
            case "ArrowUp":
                keys.forward = false;
                break;
            case "KeyS":
            case "ArrowDown":
                keys.back = false;
                break;
            case "ArrowLeft":
            case "KeyA":
                keys.left = false;
                break;
            case "ArrowRight":
            case "KeyD":
                keys.right = false;
                break;
        }
    });
    requestAnimationFrame(loop);
};
const processKeys = () => {
    if (keys.forward === keys.back) {
        car.setA(0);
        car.setBrake(false);
    }
    else if (keys.forward) {
        car.setA(500);
    }
    else {
        car.setBrake(true);
    }
    if (keys.left === keys.right) {
        car.setHeadingA(0);
    }
    else if (keys.left) {
        if (car.getHeadingV() > 0)
            car.setHeadingV(0);
        car.setHeadingA(-100);
    }
    else {
        if (car.getHeadingV() < 0)
            car.setHeadingV(0);
        car.setHeadingA(100);
    }
};
const reset = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};
const loop = () => {
    time.updateTime();
    reset();
    path.renderPath(ctx, 50);
    processKeys();
    car.setDeltaTime(time.delatTime);
    car.move();
    car.render();
    requestAnimationFrame(loop);
};
window.onload = () => {
    fetch('../data/points.json')
        .then((response) => {
        return response.json();
    })
        .then((json) => {
        path = new path_1.default(json.points);
        init();
    })
        .catch((err) => {
        console.log(err);
    });
};

},{"./car":1,"./path":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utils_1 = require("./utils");
class Path {
    constructor(points) {
        this.points = [];
        this.points = points;
    }
    renderPath(ctx, pathWidth) {
        //for (const p of points) drawP(p);
        ctx.beginPath();
        ctx.strokeStyle = "white";
        for (let t = 0; t <= 1; t += 0.0001) {
            // first test: lerp between all the points in order
            // WRONG - this needs to be recursive
            const recurse = (lines, t) => {
                // return when there is just one line left
                if (lines.length === 0)
                    return;
                if (lines.length === 1) {
                    const { x, y } = (0, utils_1.lerp)(lines[0].p, lines[0].r, t);
                    ctx.lineTo(x, y);
                    return;
                }
                // find the lerped point of each line
                const lerpedPoints = [];
                for (let i = 0; i < lines.length; i++) {
                    const line = lines[i];
                    lerpedPoints.push((0, utils_1.lerp)(line.p, line.r, t));
                }
                const newLines = [];
                for (let i = 0; i < lerpedPoints.length - 1; i++) {
                    newLines.push(new utils_1.Line(lerpedPoints[i], lerpedPoints[i + 1]));
                }
                recurse(newLines, t);
            };
            // create the first set of lines
            const lines = [];
            for (let i = 0; i < this.points.length - 1; i++) {
                lines.push(new utils_1.Line(this.points[i], this.points[i + 1]));
            }
            recurse(lines, t);
        }
        ctx.lineWidth = pathWidth;
        ctx.stroke();
    }
}
exports.default = Path;

},{"./utils":5}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lerp = exports.Line = void 0;
class Line {
    constructor(p, r) {
        this.p = p;
        this.r = r;
    }
}
exports.Line = Line;
function lerp(p, r, t) {
    return {
        x: p.x + t * (r.x - p.x),
        y: p.y + t * (r.y - p.y)
    };
}
exports.lerp = lerp;

},{}]},{},[2]);
