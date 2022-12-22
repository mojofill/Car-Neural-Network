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
