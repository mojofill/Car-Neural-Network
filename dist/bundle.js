(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const layer_1 = __importDefault(require("./layer"));
const utils_1 = require("../utils");
// start off simple - simply create a neural network that doesnt learn yet
class AI {
    constructor(path, car) {
        this.path = path;
        this.car = car;
        this.layerAmount = 4;
        this.layers = [];
        this.neuronsInLayer = [5, 4, 3, 2];
        this.timeAlive = 0;
        this.distanceCovered = 0;
        // create the neural network
        for (let i = 0; i < this.layerAmount; i++) {
            // either null or the prev/next layer based on current layer index
            const previousLayer = i === 0 ? null : this.layers[i - 1];
            const nextLayer = i === this.layerAmount - 1 ? null : this.layers[i + 1];
            // create the next layer
            const layer = new layer_1.default(this.neuronsInLayer[i], previousLayer, nextLayer);
            // loop through all of current layer's neurons and connect them to prev/next layer
            for (let w = 0; w < layer.neuronAmount; w++) {
                const current_neuron = layer.get(w);
                current_neuron.previousLayer = previousLayer;
                current_neuron.nextLayer = nextLayer;
            }
            this.layers.push(layer);
        }
        // hopefully this works!!
    }
    /**
     * returns the last layer - the output layer, which consists of two neurons: acceleration and turn velocity
     *
     * gotta refactor the control system bruh
     */
    evaluate() {
        // feedforward - information only propagates forward
        // start from the second one
        for (let i = 1; i < this.layerAmount; i++) {
            const currLayer = this.layers[i];
            for (let k = 0; k < currLayer.neuronAmount; k++) {
                const neuron = currLayer.get(k);
                neuron.value = neuron.evaluate();
            }
        }
        return this.layers[this.layerAmount - 1];
    }
    /** return a dummy neural network with the same coefficients and biases */
    copy() {
        let ai = new AI(this.path, this.car);
        // create the neural network
        for (let i = 0; i < this.layerAmount; i++) {
            // either null or the prev/next layer based on current layer index
            const previousLayer = i === 0 ? null : this.layers[i - 1];
            const nextLayer = i === this.layerAmount - 1 ? null : this.layers[i + 1];
            // create the next layer
            const layer = new layer_1.default(this.neuronsInLayer[i], previousLayer, nextLayer);
            // loop through all of current layer's neurons and connect them to prev/next layer
            for (let w = 0; w < layer.neuronAmount; w++) {
                const current_neuron = layer.get(w);
                current_neuron.previousLayer = previousLayer;
                current_neuron.nextLayer = nextLayer;
            }
            ai.layers.push(layer);
        }
        return ai;
    }
    translateOutput(a, heading_v) {
        this.car.setA(a * 100);
        // testing!! remove zero after
        this.car.setHeadingV((2 * heading_v - 1) * this.car.maxHeadingV * 0.1 * 0);
    }
    getFitness() {
        return this.distanceCovered / this.timeAlive;
    }
    updateDistanceTraveled() {
        const points = this.path.points;
        const car = this.car;
        // slowly create the pathway again with the points, return t value where it is the closest
        let minD;
        for (let t = 0; t <= 1; t += 0.0001) {
            // first test: lerp between all the points in order
            // WRONG - this needs to be recursive
            function recurse(lines, t) {
                // return when there is just one line left
                // stupid ass bug wtf
                if (points.length === 1)
                    return points[0];
                if (lines.length === 1) {
                    return (0, utils_1.lerp)(lines[0].p, lines[0].r, t);
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
                return recurse(newLines, t);
            }
            // create the first set of lines
            const lines = [];
            for (let i = 0; i < points.length - 1; i++) {
                lines.push(new utils_1.Line(points[i], points[i + 1]));
            }
            const { x, y } = recurse(lines, t);
            const d = Math.sqrt((x - car.x) ** 2 + (y - car.y) ** 2);
            if (d > utils_1.PATH_WIDTH) {
                continue;
            }
            if (minD === undefined)
                minD = d;
            else {
                if (d >= minD) {
                    this.distanceCovered = t;
                    return;
                }
                else
                    minD = d;
            }
        }
    }
}
exports.default = AI;

},{"../utils":8,"./layer":2}],2:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const neuron_1 = __importDefault(require("./neuron"));
class Layer {
    constructor(neuronAmount, previousLayer, nextLayer) {
        this.neuronAmount = neuronAmount;
        this.neurons = [];
        for (let i = 0; i < neuronAmount; i++) {
            this.neurons.push(new neuron_1.default(previousLayer, nextLayer));
        }
    }
    /** returns neuron at `k` */
    get(k) {
        return this.neurons[k];
    }
    set(k, n) {
        this.neurons[k].value = n;
    }
}
exports.default = Layer;

},{"./neuron":3}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sigmoid = void 0;
function sigmoid(x) {
    return 1 / (1 + Math.pow(Math.E, -x));
}
exports.sigmoid = sigmoid;
class Neuron {
    constructor(previousLayer, nextLayer) {
        this.previousLayer = previousLayer;
        this.nextLayer = nextLayer;
        this.weight = Math.random() * 2 - 1;
        this.bias = 0;
        this.value = Math.random();
    }
    evaluate() {
        let sum = 0;
        if (this.previousLayer === null)
            return this.value; // the input layer cant evaluate anything, just return initial value
        for (let i = 0; i < this.previousLayer.neuronAmount; i++) {
            sum += this.previousLayer.neurons[i].weight * this.value;
        }
        sum += this.bias;
        return sigmoid(sum);
    }
}
exports.default = Neuron;

},{}],4:[function(require,module,exports){
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
const width = 10;
const height = 20;
const maxV = 200;
const maxHeadingV = 3.5;
class Sensor {
    constructor(car, angle) {
        this.car = car;
        this.angle = angle;
    }
    /** returns a number that represents distance from closest edge */
    sense() {
        const direction = {
            x: Math.cos(this.car.heading + this.angle - Math.PI / 2),
            y: Math.sin(this.car.heading + this.angle - Math.PI / 2)
        };
        let t = 0;
        // move in direction until first border pixel is met
        while (true) { // dangerous!!!! no cap!!!! i hate while loops!!!
            t += 0.25;
            const x = Math.floor(this.car.x + direction.x * t);
            const y = Math.floor(this.car.y + direction.y * t);
            if (y >= this.car.path.map.length || x >= this.car.path.map[0].length || x < 0 || y < 0) {
                this.car.respawn();
                return this.sense();
            }
            if (this.car.path.map[y][x] === path_1.PointType.Border) {
                return {
                    x: x,
                    y: y
                };
            }
        }
    }
}
class Car extends renderedObj_1.default {
    constructor(ctx, spawn, direction) {
        super(ctx);
        this.spawn = spawn;
        this.path = new path_1.default([], { x: 0, y: 0 }, 0); // shitty code, but this is the only way
        this.spawnDirection = 0;
        this.sensors = [];
        this.spawnDirection = direction;
        this.setPose(spawn.x, spawn.y, direction);
        this.setDimensions(width, height);
        this.setColor(color);
        this.setMaxVelocity(maxV);
        this.setMaxHeadingVelocity(maxHeadingV);
        for (let k = -Math.PI / 3; k <= Math.PI / 3; k += Math.PI / 6) {
            this.sensors.push(new Sensor(this, k));
        }
    }
    setPath(path) {
        this.path = path;
    }
    collisionDetect() {
        // here is to check collisions and stuff
        const points = (0, utils_1.pixelate)(this);
        this.ctx.fillStyle = this.color;
        for (const p of points) {
            this.ctx.fillRect(p.x, p.y, 1, 1);
        }
        for (const p of points) {
            if (p.x >= 0 && p.x < this.path.map[0].length && p.y >= 0 && p.y < this.path.map.length) {
                const pixel = this.path.map[p.y][p.x];
                if (pixel === path_1.PointType.Empty || pixel === path_1.PointType.Border) {
                    return true;
                }
            }
        }
        return false;
    }
    respawn() {
        this.x = this.spawn.x;
        this.y = this.spawn.y;
        this.heading = this.spawnDirection;
        this.a = 0;
        this.v = 0;
        this.headingA = 0;
        this.headingV = 0;
    }
}
exports.default = Car;

},{"./path":6,"./renderedObj":7,"./utils":8}],5:[function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const car_1 = __importDefault(require("./car"));
const path_1 = __importDefault(require("./path"));
const ai_1 = __importDefault(require("./ai/ai"));
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
    get deltaTime() {
        return this.curr - this.past;
    }
};
let path; // use later for pixel detection stuff
const image = new Image();
image.onload = () => ctx.drawImage(image, 0, 0);
image.src = '../src/pathImage.png';
// todo, build a whole lotta cars
const AIs = [];
const AIAmount = 1;
let deadAIAmount = 0;
let sortedAIs = []; // ass name, basically sorts the AI's from the worst to best
const keys = {
    forward: false,
    back: false,
    left: false,
    right: false
};
const init = () => {
    //manualControls();
    requestAnimationFrame(loop);
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
    for (const ai of AIs) {
        const car = ai.car;
        car.setDeltaTime(time.deltaTime);
        car.move();
        car.render();
        for (let i = 0; i < car.sensors.length; i++) {
            const sensor = car.sensors[i];
            const { x, y } = sensor.sense();
            // put the distance of each inside the neural network input layer - in this order
            const distance = Math.sqrt((x - car.x) ** 2 + (y - car.y) ** 2);
            const inputLayer = ai.layers[0];
            inputLayer.set(i, distance);
        }
        const data = ai.evaluate();
        const a = data.get(0).value;
        const heading_v = data.get(1).value;
        ai.translateOutput(a, heading_v);
        // record how far along the cars have gone, the two cars that went the farthest produce the new batch of cars, where the children plus to two cars equal the AIAmount
        if (car.collisionDetect()) {
            // i need a fitness function
            // update distance covered first, then i can get fitness with distance/time
            ai.updateDistanceTraveled();
            // put the player back in the beginning
            car.respawn();
        }
        else {
            ai.timeAlive += time.deltaTime;
        }
    }
    requestAnimationFrame(loop);
};
window.onload = () => {
    fetch('../data/points.json')
        .then((response) => {
        return response.json();
    })
        .then((json) => {
        path = new path_1.default(json.points, json.spawn, json.direction);
        fetch('../data/map.json')
            .then((response) => {
            return response.json();
        })
            .then((mapJson) => {
            const _init = () => {
                path.setBorderPixels();
                init();
            };
            if (mapJson.data === undefined) {
                path.pixelate(canvas, 1);
                const obj = {
                    "data": path.map
                };
                const string = JSON.stringify(obj);
                navigator.clipboard.writeText(string).then(() => {
                    _init();
                });
            }
            else {
                path.map = mapJson.data;
                for (let i = 0; i < AIAmount; i++) {
                    const ai = new ai_1.default(path, new car_1.default(ctx, json.spawn, json.direction + Math.PI / 2));
                    ai.car.setPath(path);
                    AIs.push(ai);
                }
                _init();
            }
            ;
        });
    })
        .catch((err) => {
        console.log(err);
    });
};

},{"./ai/ai":1,"./car":4,"./path":6}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PointColors = exports.PointType = void 0;
var PointType;
(function (PointType) {
    PointType[PointType["Road"] = 0] = "Road";
    PointType[PointType["Empty"] = 1] = "Empty";
    PointType[PointType["Border"] = 2] = "Border";
})(PointType = exports.PointType || (exports.PointType = {}));
class PointColors {
}
exports.PointColors = PointColors;
PointColors.road = [255, 255, 255];
PointColors.car = [255, 0, 0];
class Path {
    constructor(points, spawn, direction) {
        this.points = points;
        this.spawn = spawn;
        this.direction = direction;
        this.map = [];
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
                        this.map[y][x] = PointType.Border;
                        break;
                    }
                }
            }
        }
    }
}
exports.default = Path;

},{}],7:[function(require,module,exports){
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
    move() {
        this.x += this.v * Math.cos(this.heading - Math.PI / 2) * this.deltaTime;
        this.y += this.v * Math.sin(this.heading - Math.PI / 2) * this.deltaTime;
        this.heading += this.headingV;
        this.v += this.a * this.deltaTime;
        this.headingV += this.headingA * this.deltaTime;
        if (this.v >= this.maxV) {
            this.v = this.maxV;
        }
        if (this.v < 0) {
            this.v = 0;
        }
        if (Math.abs(this.headingV) >= this.maxHeadingV) {
            this.headingV = Math.sign(this.headingV) * this.maxHeadingV;
        }
    }
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

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.round = exports.pixelate = exports.lerp = exports.Line = exports.PATH_WIDTH = exports.UNIT_WIDTH = void 0;
exports.UNIT_WIDTH = 1;
exports.PATH_WIDTH = 50;
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

},{}]},{},[5]);
