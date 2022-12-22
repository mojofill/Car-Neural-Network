"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const layer_1 = __importDefault(require("./layer"));
// start off simple - simply create a neural network that doesnt learn yet
class AI {
    constructor(path, car) {
        this.path = path;
        this.car = car;
        this.layerAmount = 4;
        this.layers = [];
        this.neuronsInLayer = [5, 4, 3, 2];
        // create the neural network
        for (let i = 0; i < this.layerAmount; i++) {
            // either null or the prev/next layer based on current layer index
            const previousLayer = i === 0 ? null : this.layers[i - 1];
            const nextLayer = i === this.layerAmount - 1 ? null : this.layers[i + 1];
            // create the next layer
            const layer = new layer_1.default(this.neuronsInLayer[i], previousLayer, nextLayer);
            this.layers.push(layer);
            // loop through all of current layer's neurons and connect them to prev/next layer
            for (let w = 0; w < layer.neuronAmount; w++) {
                const current_neuron = layer.get(w);
                current_neuron.previousLayer = previousLayer;
                current_neuron.nextLayer = nextLayer;
            }
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
    copy() {
    }
    translateOutput(a, heading_v) {
        this.car.setA(a * 100);
        this.car.setHeadingV((2 * heading_v - 1) * this.car.maxHeadingV * 0.1);
    }
}
exports.default = AI;
