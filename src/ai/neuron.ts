import Layer from "./layer";

export function sigmoid(x: number) {
    return 1 / (1 + Math.pow(Math.E, -(1 / 128) * x));
}

export default class Neuron {
    public weight: number = (Math.random() * 2 - 1);
    public bias: number = (Math.random() * 2 - 1);
    public value: number = 0;
    constructor(public layerIndex: number) {}

    evaluate(layers: Array<Layer>) {
        let sum = 0;
        if (this.layerIndex === 0) return this.value; // the input layer cant evaluate anything, just return initial value
        const previousLayer = layers[this.layerIndex-1]
        for (let i = 0; i < previousLayer.neuronAmount; i++) {
            sum += previousLayer.get(i).weight * this.value;
        }

        sum += this.bias;
        return sigmoid(sum);
    }

    // something about activations? rewatch the video
}