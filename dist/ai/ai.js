"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const car_1 = __importDefault(require("../car"));
const layer_1 = __importDefault(require("./layer"));
const utils_1 = require("../utils");
// start off simple - simply create a neural network that doesnt learn yet
class AI {
    constructor(path, car, ctx) {
        // create the neural network
        this.path = path;
        this.car = car;
        this.ctx = ctx;
        this.layerAmount = 4;
        this.layers = [];
        this.neuronsInLayer = [8, 4, 3, 2];
        this.distanceCovered = 0;
        this.mutateMaxStep = 500;
        for (let i = 0; i < this.layerAmount; i++) {
            // create the next layer
            const layer = new layer_1.default(this.neuronsInLayer[i], i);
            this.layers.push(layer);
        }
    }
    getRandomRange(min, max) {
        return Math.random() * (max - min) + min;
    }
    getRandomSign() {
        return Math.random() > 0.5 ? 1 : -1;
    }
    /** returns `n` amount of children AI in an `Array<AI>`*/
    produceNChildren(ai, n) {
        const arr = [];
        const maxFitness = Math.max(this.getFitness(), ai.getFitness());
        const mutateChance = (1 - maxFitness) * 0.25 + 0.15;
        for (let i = 0; i < n; i++) {
            const car = new car_1.default(this.ctx, this.car.spawn, this.car.spawnDirection, this.path);
            const child = new AI(this.path, car, this.ctx);
            // first grab random weights and biases from each parent
            // grab ~50% of each parent's weight and bias
            for (let i = 0; i < this.layerAmount; i++) {
                for (let j = 0; j < this.neuronsInLayer[i]; j++) {
                    // randomly grab either this or ai's weight and bias, 50/50 chance
                    // mutate based on mutateChance
                    // either completely rewrite, or change slightly
                    // try changing slightly first
                    // if mutate, then randomly change by [-max, max] step
                    const mutate = Math.random() < mutateChance;
                    // weight
                    const parentOfWeight = Math.random() < 0.5 ? this : ai;
                    let weight = parentOfWeight.layers[i].get(j).weight;
                    if (mutate)
                        weight += this.getRandomSign() * this.getRandomRange(0.75, 1) * this.mutateMaxStep;
                    // bias
                    const parentOfBias = Math.random() < 0.5 ? this : ai;
                    let bias = parentOfBias.layers[i].get(j).bias;
                    if (mutate)
                        bias += this.getRandomSign() * this.getRandomRange(0.75, 1) * this.mutateMaxStep;
                    // set the randomly selected weights and biases for this one neuron
                    child.layers[i].get(j).weight = weight;
                    child.layers[i].get(j).bias = bias;
                }
            }
            arr.push(child);
        }
        return arr;
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
                neuron.value = neuron.activate(this.layers); // activate each neuron
                // if (neuron.value === 0) {
                //     console.log(this.layers);
                //     throw new Error();
                // }
            }
        }
        return this.layers[this.layerAmount - 1];
    }
    /** return a dummy neural network with the same coefficients and biases */
    copy() {
        let ai = new AI(this.path, this.car, this.ctx);
        // create the neural network
        for (let i = 0; i < this.layerAmount; i++) {
            // create the next layer
            const layer = new layer_1.default(this.neuronsInLayer[i], i);
            ai.layers.push(layer);
        }
        return ai;
    }
    translateOutput(a, heading_v) {
        // testing!! remove psoitive and zero after
        this.car.setA((2 * a - 1) * 500);
        this.car.setHeadingV((2 * heading_v - 1) * this.car.maxHeadingV);
    }
    /** returns a value between [0, 1] */
    getFitness() {
        return (this.distanceCovered ** 2) / this.car.timeAlive;
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
            const { x, y } = recurse(lines, t); // point at t
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
