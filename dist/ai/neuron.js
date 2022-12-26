"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sigmoid = void 0;
function sigmoid(x) {
    return 1 / (1 + Math.pow(Math.E, -x));
}
exports.sigmoid = sigmoid;
class Neuron {
    constructor(layerIndex) {
        this.layerIndex = layerIndex;
        this.weight = (Math.random() * 2 - 1);
        this.bias = (Math.random() * 2 - 1);
        this.value = 0;
    }
    activate(layers) {
        if (this.layerIndex === 0)
            return this.value; // the input layer cant evaluate anything, just return initial value
        let sum = 0;
        const previousLayer = layers[this.layerIndex - 1];
        for (let i = 0; i < previousLayer.neuronAmount; i++) {
            const neuron = previousLayer.get(i);
            sum += neuron.weight * neuron.value;
        }
        sum += this.bias;
        return sigmoid(sum);
    }
}
exports.default = Neuron;
