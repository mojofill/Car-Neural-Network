import Neuron from "./neuron";

export default class Layer {
    public neurons: Array<Neuron> = [];

    constructor(public neuronAmount: number, public layerIndex: number) {
        for (let i = 0; i < neuronAmount; i++) {
            this.neurons.push(new Neuron(layerIndex));
        }
    }

    /** returns neuron at `k` */
    get(k: number) {
        return this.neurons[k];
    }

    set(k: number, n: number) {
        this.neurons[k].value = n;
    }
}