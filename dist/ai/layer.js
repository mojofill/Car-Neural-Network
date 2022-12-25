"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const neuron_1 = __importDefault(require("./neuron"));
class Layer {
    constructor(neuronAmount, layerIndex) {
        this.neuronAmount = neuronAmount;
        this.layerIndex = layerIndex;
        this.neurons = [];
        for (let i = 0; i < neuronAmount; i++) {
            this.neurons.push(new neuron_1.default(layerIndex));
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
