import Car from '../car';
import Path from '../path';
import Layer from './layer';

// start off simple - simply create a neural network that doesnt learn yet
export default class AI {
    public layerAmount: number = 4;
    public layers: Array<Layer> = [];
    public neuronsInLayer: Array<number> = [5, 4, 3, 2];

    constructor(public path: Path, public car: Car) {
        // create the neural network
        for (let i = 0; i < this.layerAmount; i++) {
            // either null or the prev/next layer based on current layer index
            const previousLayer = i === 0 ? null : this.layers[i-1];
            const nextLayer = i === this.layerAmount - 1 ? null : this.layers[i+1];

            // create the next layer
            const layer = new Layer(this.neuronsInLayer[i], previousLayer, nextLayer);
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
    evaluate() : Layer {
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

    /** i need to learn more about backpropagation and how to use it here
    
    * this is gonna be a loooooong function
     */
    learn() {

    }
}