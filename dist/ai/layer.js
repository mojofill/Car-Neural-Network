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
