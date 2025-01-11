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
  it('qr decomposition', () => {
    const mat = ft.tensor([[1, 2], [3, 4]]);
    const [q,r] = mat.qr();
    expect(q.array()).to.deep.equal(
      [
        [ -0.31622767448425293, 0.9486832022666931 ],
        [ -0.9486832022666931, -0.31622785329818726 ]
      ]
    );
    expect(r.array()).to.deep.equal(
      [
        [ -3.1622772216796875, -4.427187919616699 ],
        [ 2.384185791015625e-7, 0.6324548721313477 ]
      ]

    );
  });

  it.skip('should outperform tfjs-node', () => {
    const cycles = 1E4;
    const data = [
      [1, 2, 3, 4, 5, 6],
      [1, 2, 3, 4, 5, 6],
      [1, 2, 3, 4, 5, 6],
      [1, 2, 3, 4, 5, 6],
      [1, 2, 3, 4, 5, 6],
      [1, 2, 3, 4, 5, 6],
    ];

    let startTime = performance.now();
    for (let c = 0; c < cycles; c++) {
      tf.tidy(() => {
        const a = tf.tensor2d(data);
        const [q,r] = tf.linalg.qr(a);
      });
    }
    console.log((performance.now() - startTime) / cycles);
    startTime = performance.now();
    for (let c = 0; c < cycles; c++) {
      Tensor.scope(() => {
        const a = new Tensor(data);
        const [q,r] = a.qr();
      });
    }
    console.log((performance.now() - startTime) / cycles);
  });
}
