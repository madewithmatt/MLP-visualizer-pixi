import * as tf from '@tensorflow/tfjs';
import type { Tensor2D } from '@tensorflow/tfjs';

type ParamsType = {
    [key: string] : number[][];
}

let isRunning = false;

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

/**
 * Returns weight*activations and activation values.
 * PLEASE DISPOSE OF TENSORS AFTER USE!!!!
 * @param weights 
 * @param biases 
 * @param input number[][]
 * @returns weightActivations: Float32Array[] and activations: Float32Array
 */
export async function runForwardProp(weights: Tensor2D[], biases: Tensor2D[], input: number[][]) {
    if (isRunning) return null;
    isRunning = true;
    const activations: Float32Array[] = [];
    const weightActivations: Float32Array[] = [];
    const promises = [];

    // Convert input into flattened tensor and push into activations
    let a: tf.Tensor = tf.tensor2d(input.flat(), [28 * 28, 1], "float32");
    promises.push(a.data().then(data => activations.push(data as Float32Array)));
    // Start forward prop
    for (let i = 0; i < weights.length; i++) {
        // weights[i]: [out_dim, in_dim], a: [in_dim, 1]
        // a: [in_dim, 1]
        // Compute weight * activation for each connection: [out_dim, in_dim]
        const aT = a.transpose(); // [1, in_dim]
        const wT = weights[i].transpose(); // [in_dim, out_dim]
        const wA = wT.mul(a); // [out_dim, in_dim]
        promises.push(wA.data().then(data => weightActivations.push(data as Float32Array)));

        // preactivation z = W * a + b:
        // since we already have wA consider leveraging it for faster calc
        const z = tf.add(tf.matMul(weights[i], a), biases[i]); // [out_dim, 1]

        // Wait for a.data() to be done
        // Activation functions
        if (i === weights.length - 1) {
            a = tf.softmax(z.transpose()).transpose();
        } else {
            a = tf.relu(z);
        }

        // push a to activations
        promises.push(a.data().then(data => activations.push(data as Float32Array)));
    }
    // Get top 2 predictions as promise
    const { indices } = tf.topk(a.reshape([-1]), 2);
    promises.push(indices.data());

    // Wait all promises that havent finished yet
    const results = await Promise.all(promises);

    // Retrieve top predictions (top predictions is always last promise)
    const indicesArray = results[results.length - 1] as Float32Array

    isRunning = false;
    console.log("prediction1: ", indicesArray[0]);
    console.log("prediction2: ", indicesArray[1]);

    return { weightActivations, activations, prediction1: indicesArray[0], prediction2: indicesArray[1] };
}