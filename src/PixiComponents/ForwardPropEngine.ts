import * as tf from '@tensorflow/tfjs';
import type { Tensor2D } from '@tensorflow/tfjs';

type ParamsType = {
    [key: string] : number[][];
}


export async function initializeEngine() {
    // Set tf to use webgl for faster computation
    await tf.setBackend('webgl');
    await tf.ready();

    // fetch model parameters (weights and biases)
    const params = await fetch('/modelParameters.json')
        .then((res) => res.json())
        .catch(() => {throw Error("Failed to fetch modelParameters.json")});
    
    const { weights, biases } = createTensorsFromParams(params);

    return { weights, biases };
}

const createTensorsFromParams = (params: ParamsType) : { weights: Tensor2D[], biases: Tensor2D[] } => {
    const Ws: tf.Tensor2D[] = [];
    const bs: tf.Tensor2D[] = [];
    Object.keys(params).sort().forEach((key) => {
        if (key.startsWith("W")) {
            const mat = params[key] as number[][];
            Ws.push(tf.tensor2d(mat, undefined, "float32"));
        } else if (key.startsWith("b")) {
            const arr = params[key] as number[][];
            bs.push(tf.tensor2d(arr, undefined, "float32"));
        }
    });
    return { weights: Ws, biases: bs};
}