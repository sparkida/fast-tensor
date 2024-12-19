/**
 * This should follow closely with Tensorflow.js 
 * @see https://js.tensorflow.org/api/latest
 */
import creation from './creation.js';
import arithmetic from './arithmetic.js';
import benchmark from './benchmark.js';
import basicmath from './basicmath.js';
import reduction from './reduction.js';
import matrices from './matrices.js';
import transformations from './transformations.js';
import immutability from './immutability.js';
import slicejoin from './slicejoin.js';

export default function() {

  describe('Input/Output Data', () => {
    it('should infer the shape from an array');
  });

  describe('Memory management', () => {
    it('should handle retaining last pointer when run in scope', () => {
      const retained = Tensor.scope(() => {
        const mat1 = new Tensor([[1,2], [3,4]]);
        const mat2 = mat1.clone();
        return mat2.add(1);
      });
      expect(retained.data()).to.have.members([2,3,4,5]);
      expect(Tensor.memory().pointers).to.eql(1);
      retained.delete();
    });
  });


  describe('Creation', creation);
  describe('Arithmetic', arithmetic);
  describe('Basic math', basicmath);
  describe('Reduction', reduction);
  describe('Matrices', matrices);
  describe('Transformations', transformations);
  describe('Immutability', immutability);
  describe('Slicing and joining', slicejoin);

  describe.skip('Benchmark', benchmark);

}
