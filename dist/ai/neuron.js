"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sigmoid = void 0;
function sigmoid(x) {
    return 1 / (1 + Math.pow(Math.E, -(1 / 128) * x));
}
exports.sigmoid = sigmoid;
class Neuron {
    constructor(layerIndex) {
        this.layerIndex = layerIndex;
        this.weight = (Math.random() * 2 - 1);
        this.bias = (Math.random() * 2 - 1);
        this.value = 0;
    }
    evaluate(layers) {
        let sum = 0;
        if (this.layerIndex === 0)
            return this.value; // the input layer cant evaluate anything, just return initial value
        const previousLayer = layers[this.layerIndex - 1];
        for (let i = 0; i < previousLayer.neuronAmount; i++) {
            sum += previousLayer.get(i).weight * this.value;
        }
        sum += this.bias;
        return sigmoid(sum);
    }
}
exports.default = Neuron;
