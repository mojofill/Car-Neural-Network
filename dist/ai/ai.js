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
        this.neuronsInLayer = [13, 4, 3, 2];
        this.distanceCovered = 0;
        this.maxBinaryLength = 58;
        for (let i = 0; i < this.layerAmount; i++) {
            // create the next layer
            const layer = new layer_1.default(this.neuronsInLayer[i], i);
            this.layers.push(layer);
        }
        // hopefully this works!!
        // create my DNA strand
        // DNA strand include weights and biases
        let str = '';
        for (let i = 0; i < this.layerAmount; i++) {
            for (let u = 0; u < this.neuronsInLayer[i]; u++) {
                const neuron = this.layers[i].get(u);
                const weight = (0, utils_1.toBinary)(neuron.weight);
                const bias = (0, utils_1.toBinary)(neuron.bias);
                for (const s of weight)
                    if (s === '.')
                        console.log('problem weight: ' + neuron.weight);
                for (const s of bias)
                    if (s === '.')
                        console.log('problem bias: ' + neuron.bias);
                str += (0, utils_1.toBinary)(neuron.weight) + (0, utils_1.toBinary)(neuron.bias);
            }
        }
        this.DNA = str;
    }
    /** returns `n` amount of children AI in an `Array<AI>`*/
    produceNChildren(ai, n) {
        const arr = [];
        const maxFitness = Math.max(this.getFitness(), ai.getFitness());
        const mutateChance = (-1 / (1 + Math.pow(Math.E, -3 * maxFitness)) + 1) * 0.05;
        const minSegment = 1;
        const maxSegment = 13;
        let dummy = ai;
        let track = 0;
        for (let i = 0; i < n; i++) {
            // first create the DNA segment
            // randomly cut up the DNA
            const cutupDNA = [];
            const car = new car_1.default(this.ctx, this.car.spawn, this.car.direction, this.path);
            const newChildAI = new AI(this.path, car, this.ctx);
            let k = 0;
            while (true) {
                let step = Math.floor(Math.random() * (maxSegment - minSegment + 1) + maxSegment);
                if (k + step >= this.DNA.length)
                    step = this.DNA.length - k - 1;
                if (step === 0)
                    break;
                cutupDNA.push(dummy.DNA.slice(k, k + step));
                if (track === 0)
                    dummy = this;
                else
                    dummy = ai;
                k += step;
                track = Math.abs(track - 1);
            }
            let g = 0;
            let DNA = cutupDNA.join('');
            for (let i = 0; i < DNA.length; i++) {
                if (Math.random() < mutateChance) {
                    g++;
                    const digit = parseInt(DNA.charAt(i));
                    DNA = (0, utils_1.replaceAt)(DNA, i, '' + Math.abs(digit - 1));
                }
            }
            console.log('mutated ' + g + ' genes');
            let p = 0;
            const newCutUpDNA = [];
            for (const substr of cutupDNA) {
                newCutUpDNA.push(DNA.slice(p, p + substr.length));
                p += substr.length;
            }
            const newDNA = newCutUpDNA.join('');
            // DNA goes weight, bias, weight, bias ...
            // now we have a mutated DNA strand thats cut up and ready to be put back into a neural network
            let neuronIndex = 0;
            let layerIndex = 0;
            for (let i = 0; i < newDNA.length / maxSegment; i++) {
                const weightDNA = newDNA.slice(i * maxSegment, (i + 1) * maxSegment - 1);
                const biasDNA = newDNA.slice((i + 1) * maxSegment, (i + 2) * maxSegment - 1);
                i++;
                newChildAI.layers[layerIndex].get(neuronIndex).weight = (0, utils_1.parseBinary)(weightDNA);
                newChildAI.layers[layerIndex].get(neuronIndex).bias = (0, utils_1.parseBinary)(biasDNA);
                if (neuronIndex === this.neuronsInLayer[layerIndex] - 1) { // maxed out all the neurons in this layer
                    layerIndex++;
                    neuronIndex = 0;
                }
                else {
                    neuronIndex++;
                }
            }
            arr.push(newChildAI);
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
                neuron.value = neuron.evaluate(this.layers);
                if (neuron.value === 0) {
                    console.log(this.layers);
                    throw new Error();
                }
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
        return this.distanceCovered;
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
