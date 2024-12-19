import { Matrix as MLMatrix } from 'ml-matrix';
import * as math from 'mathjs';
import * as tf from '@tensorflow/tfjs';


export default function() {

  before(async () => {
    await tf.ready();
    // warm up
    tf.tidy(() => {
      tf.tensor([1,2,3,4]).add(1);
    });

  });
  this.timeout(100000);

  it.skip('should outperform tfjs-node', () => {
    const rows = 5;
    const cols = 100;
    const data = [];
    const cycles = 1E4;

    for (let i = 0; i < rows; i++) {
      const row = Array(cols);
      for (let j = 0; j < cols; j++) {
        row[j] = Math.random();
      }
      data.push(row);
    }
    let startTime = performance.now();
    for (let c = 0; c < cycles; c++) {
      tf.tidy(() => {
        const a = tf.tensor(data);
        const b = a.add(10.1);
        const c = b.add(a).add(a).add(a);
        c.matMul(b.transpose());
      });
    }
    console.log((performance.now() - startTime) / cycles);
    startTime = performance.now();
    for (let c = 0; c < cycles; c++) {
      Tensor.scope(() => {
        const a = new Tensor(data);
        const b = a.add(10.1);
        const c = b.add(a).add(a).add(a);
        c.matMul(b.transpose());
      });
    }
    console.log((performance.now() - startTime) / cycles);
  });

  it.skip('should outperform ml-matrix', () => {
    const rows = 5;
    const cols = 100;
    const data = [];
    const cycles = 1E5;

    for (let i = 0; i < rows; i++) {
      const row = Array(cols);
      for (let j = 0; j < cols; j++) {
        row[j] = Math.random();
      }
      data.push(row);
    }
    let startTime = performance.now();
    for (let c = 0; c < cycles; c++) {
      const a = new MLTensor(data);
      const b = a.clone().add(10.1);
      a.mmul(b.transpose());
    }
    console.log((performance.now() - startTime) / cycles);
    startTime = performance.now();
    for (let c = 0; c < cycles; c++) {
      Tensor.scope(() => {
        const a = new Tensor(data);
        const b = a.add(10.1);
        a.matMul(b.transpose());
      });
    }
    console.log((performance.now() - startTime) / cycles);
  });

  it.skip('should outperform mathjs', () => {
    const rows = 5;
    const cols = 100;
    const data = [];
    const cycles = 1;

    for (let i = 0; i < rows; i++) {
      const row = Array(cols);
      for (let j = 0; j < cols; j++) {
        row[j] = Math.random();
      }
      data.push(row);
    }
    let startTime = performance.now();
    for (let c = 0; c < cycles; c++) {
      const a = data.slice();
      const b = data.slice();
      const add = math.add(a, 10.1);
      math.multiply(add, math.transpose(b));
    }
    console.log((performance.now() - startTime) / cycles);
    startTime = performance.now();
    for (let c = 0; c < cycles; c++) {
      Tensor.scope(() => {
        const a = new Tensor(data);
        const b = a.add(10.1);
        a.matMul(b.transpose());
      });
    }
    console.log((performance.now() - startTime) / cycles);
  });

}
