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
