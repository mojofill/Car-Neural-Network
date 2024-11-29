import Layer from "./layer";

export function sigmoid(x: number) {
    return 1 / (1 + Math.pow(Math.E, -x));
}

export default class Neuron {
    public weight: number = (Math.random() * 2 - 1);
    public bias: number = (Math.random() * 2 - 1);
    public value: number = 0;
    constructor(public layerIndex: number) {}

    activate(layers: Array<Layer>) {
        if (this.layerIndex === 0) return this.value; // the input layer cant evaluate anything, just return initial value
        let sum = 0;
        const previousLayer = layers[this.layerIndex-1]
        for (let i = 0; i < previousLayer.neuronAmount; i++) {
            const neuron = previousLayer.get(i);
            sum += neuron.weight * neuron.value;
        }

        sum += this.bias;
        
        return sigmoid(sum);
    }

    // something about activations? rewatch the video
}