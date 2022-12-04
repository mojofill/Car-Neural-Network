(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importStar(require("./path"));
const renderedObj_1 = __importDefault(require("./renderedObj"));
const utils_1 = require("./utils");
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
        this.path = new path_1.default([]);
        this.setPose(startingX, startingY, startingHeading);
        this.setDimensions(width, height);
        this.setColor(color);
        this.setMaxVelocity(maxV);
        this.setMaxHeadingVelocity(maxHeadingV);
    }
    setPath(path) {
        this.path = path;
    }
    collisionDetect() {
        // here is to check collisions and stuff
        const points = (0, utils_1.pixelate)(this);
        let collided = false;
        this.ctx.fillStyle = 'blue';
        for (const p of points) {
            this.ctx.fillRect(p.x, p.y, 1, 1);
        }
        for (const p of points) {
            if (p.x >= 0 && p.x < this.path.map[0].length && p.y >= 0 && p.y < this.path.map.length) {
                if (this.path.map[p.y][p.x] === path_1.PointType.Empty) {
                    console.log('hello');
                    this.color = 'green';
                    collided = true;
                    break;
                }
            }
        }
        if (!collided)
            this.color = 'red';
    }
}
exports.default = Car;

},{"./path":3,"./renderedObj":4,"./utils":5}],2:[function(require,module,exports){
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
let path; // use later for pixel detection stuff
const image = new Image();
image.onload = () => ctx.drawImage(image, 0, 0);
image.src = '../src/pathImage.png';
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
    path.draw(ctx, image);
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
        let time1 = Date.now();
        path.pixelate(canvas, 1);
        let time2 = Date.now();
        console.log('pixelation time taken: ' + (time2 - time1) / 1000 + ' s');
        car.setPath(path);
        time1 = Date.now();
        path.setBorderPixels();
        time2 = Date.now();
        console.log('border pixelation time taken: ' + (time2 - time1) / 1000 + ' s');
        init();
    })
        .catch((err) => {
        console.log(err);
    });
};

},{"./car":1,"./path":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointColors = exports.PointType = void 0;
var PointType;
(function (PointType) {
    PointType[PointType["Road"] = 0] = "Road";
    PointType[PointType["Empty"] = 1] = "Empty";
})(PointType = exports.PointType || (exports.PointType = {}));
class PointColors {
}
exports.PointColors = PointColors;
PointColors.road = [255, 255, 255];
PointColors.car = [255, 0, 0];
class Path {
    constructor(points) {
        this.points = [];
        this.map = [];
        this.borderPixels = [];
        this.points = points;
    }
    draw(ctx, image) {
        ctx.drawImage(image, 0, 0);
    }
    arrayEquals(arr1, arr2) {
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i])
                return false;
        }
        return true;
    }
    test(canvas, ctx, UNIT_WIDTH) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                if (this.map[y][x] === PointType.Road) {
                    ctx.fillStyle = 'white';
                    ctx.fillRect(x * UNIT_WIDTH, y * UNIT_WIDTH, UNIT_WIDTH, UNIT_WIDTH);
                }
            }
        }
    }
    testBorderPixels(canvas, ctx, UNIT_WIDTH) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        for (let i = 0; i < this.borderPixels.length; i++) {
            const { x, y } = this.borderPixels[i];
            ctx.fillRect(x * UNIT_WIDTH, y * UNIT_WIDTH, UNIT_WIDTH, UNIT_WIDTH);
        }
    }
    pixelate(canvas, UNIT_WIDTH) {
        const image = new Image();
        image.src = '../src/pathImage.png';
        const ctx = canvas.getContext('2d');
        if (!ctx || !(ctx instanceof CanvasRenderingContext2D))
            throw new Error();
        for (let y = 0; y < Math.floor(canvas.height / UNIT_WIDTH); y++) {
            this.map.push([]);
            for (let x = 0; x < Math.floor(canvas.width / UNIT_WIDTH); x++) {
                let totalRoadPixels = 0;
                let totalPixels = 0;
                for (let py = y * UNIT_WIDTH; py < y * UNIT_WIDTH + UNIT_WIDTH; py++) {
                    for (let px = x * UNIT_WIDTH; px < x * UNIT_WIDTH + UNIT_WIDTH; px++) {
                        const data = ctx.getImageData(px, py, 1, 1);
                        const r = data.data[0];
                        const g = data.data[1];
                        const b = data.data[2];
                        if (this.arrayEquals([r, g, b], PointColors.road))
                            totalRoadPixels++;
                        totalPixels++;
                    }
                }
                if (totalRoadPixels / totalPixels >= 0.5)
                    this.map[y].push(PointType.Road);
                else
                    this.map[y].push(PointType.Empty);
            }
        }
    }
    setBorderPixels() {
        for (let y = 0; y < this.map.length; y++) {
            for (let x = 0; x < this.map[y].length; x++) {
                // check the neighbors, if there are both road and empty neighbors, then it is a border pixel
                let roadPixelNeighbor = false;
                let emptyPixelNeighbor = false;
                for (let dy = -1; dy <= 1; dy++) {
                    let isBorderPixel = false;
                    for (let dx = -1; dx <= 1; dx++) {
                        const py = y + dy;
                        const px = x + dx;
                        if (0 <= py && py < this.map.length && 0 <= px && px < this.map[0].length) {
                            // find pixel type of this neighbor
                            if (this.map[py][px] === PointType.Road)
                                roadPixelNeighbor = true;
                            if (this.map[py][px] === PointType.Empty)
                                emptyPixelNeighbor = true;
                            if (roadPixelNeighbor && emptyPixelNeighbor) {
                                isBorderPixel = true;
                                break;
                            }
                        }
                    }
                    if (isBorderPixel) {
                        this.borderPixels.push({ x: x, y: y });
                        break;
                    }
                }
            }
        }
    }
}
exports.default = Path;

},{}],4:[function(require,module,exports){
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
    render() {
        if (this.color === "")
            throw new Error("no color given");
        this.collisionDetect();
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
exports.round = exports.pixelate = exports.lerp = exports.Line = exports.UNIT_WIDTH = void 0;
exports.UNIT_WIDTH = 1;
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
function pixelate(obj) {
    // first pixelate the rectangle, then highlight the border
    // move tangential along the heading, then move along the two normals to turn the rectangle into a collection of evenly spaced points
    // the "step" variable (the width of the square between points) is probably the UNIT_WIDTH, i can tweak this to get the most data
    // then, round the pixels to pixelate them
    const cx = obj.x;
    const cy = obj.y;
    const points = [];
    const step = 0.01;
    const refAngle = obj.heading - Math.PI / 2;
    for (let t = 0; t <= 1; t += step) {
        // lerp along the tangent
        const p1 = {
            x: cx + t * (obj.height / 2) * Math.cos(refAngle) + (obj.width / 2) * Math.cos(refAngle + Math.PI / 2),
            y: cy + t * (obj.height / 2) * Math.sin(refAngle) + (obj.width / 2) * Math.sin(refAngle + Math.PI / 2)
        };
        const p2 = {
            x: cx + t * (obj.height / 2) * Math.cos(refAngle) + (obj.width / 2) * Math.cos(refAngle - Math.PI / 2),
            y: cy + t * (obj.height / 2) * Math.sin(refAngle) + (obj.width / 2) * Math.sin(refAngle - Math.PI / 2)
        };
        // now do the same thing, but translate down the tangent
        const p3 = {
            x: cx - t * (obj.height / 2) * Math.cos(refAngle) + (obj.width / 2) * Math.cos(refAngle + Math.PI / 2),
            y: cy - t * (obj.height / 2) * Math.sin(refAngle) + (obj.width / 2) * Math.sin(refAngle + Math.PI / 2)
        };
        const p4 = {
            x: cx - t * (obj.height / 2) * Math.cos(refAngle) + (obj.width / 2) * Math.cos(refAngle - Math.PI / 2),
            y: cy - t * (obj.height / 2) * Math.sin(refAngle) + (obj.width / 2) * Math.sin(refAngle - Math.PI / 2)
        };
        // now lerp with the normal of the object, not the tangent
        const p5 = {
            x: cx + (obj.height / 2) * Math.cos(refAngle) + t * (obj.width / 2) * Math.cos(refAngle + Math.PI / 2),
            y: cy + (obj.height / 2) * Math.sin(refAngle) + t * (obj.width / 2) * Math.sin(refAngle + Math.PI / 2)
        };
        const p6 = {
            x: cx + (obj.height / 2) * Math.cos(refAngle) + t * (obj.width / 2) * Math.cos(refAngle - Math.PI / 2),
            y: cy + (obj.height / 2) * Math.sin(refAngle) + t * (obj.width / 2) * Math.sin(refAngle - Math.PI / 2)
        };
        // now do the same thing, but translate down the tangent
        const p7 = {
            x: cx - (obj.height / 2) * Math.cos(refAngle) + t * (obj.width / 2) * Math.cos(refAngle + Math.PI / 2),
            y: cy - (obj.height / 2) * Math.sin(refAngle) + t * (obj.width / 2) * Math.sin(refAngle + Math.PI / 2)
        };
        const p8 = {
            x: cx - (obj.height / 2) * Math.cos(refAngle) + t * (obj.width / 2) * Math.cos(refAngle - Math.PI / 2),
            y: cy - (obj.height / 2) * Math.sin(refAngle) + t * (obj.width / 2) * Math.sin(refAngle - Math.PI / 2)
        };
        points.push(p1, p2, p3, p4, p5, p6, p7, p8);
    }
    for (const p of points) {
        p.x = round(p.x, 1);
        p.y = round(p.y, 1);
    }
    return points;
}
exports.pixelate = pixelate;
function round(x, multiple) {
    if (x / multiple - Math.floor(x / multiple) < 0.5)
        return Math.floor(x / multiple) * multiple;
    else
        return Math.ceil(x / multiple) * multiple;
}
exports.round = round;
// todo: rewrite the pixelation stuff
// probs should make a test html to try this stuff out firstt

},{}]},{},[2]);
