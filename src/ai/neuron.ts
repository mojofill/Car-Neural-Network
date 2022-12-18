import Layer from "./layer";

export function sigmoid(x: number) {
    return 1 / (1 + Math.pow(Math.E, -x));
}

export default class Neuron {
    public weight: number = Math.random() * 2 - 1;
    public bias: number = 0;
    public value: number = Math.random();
    constructor(public previousLayer: Layer | null, public nextLayer: Layer | null) {}

    evaluate() {
        let sum = 0;
        if (this.previousLayer === null) return this.value; // the input layer cant evaluate anything, just return initial value
        for (let i = 0; i < this.previousLayer.neuronAmount; i++) {
            sum += this.previousLayer.neurons[i].weight * this.value;
        }

        sum += this.bias;

        return sigmoid(sum);
    }

    // something about activations? rewatch the video
}