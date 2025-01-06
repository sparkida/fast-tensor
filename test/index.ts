import runner from './matrix.js';
//import { Tensor as MLTensor } from 'ml-matrix';
//import * as tf from '@tensorflow/tfjs';

/*
before(async () => {
  await Tensor.ready();
});
*/

beforeEach(() => {
  Tensor.beginScope();
});
afterEach(() => {
  Tensor.endScope();
  expect(Tensor.memory().pointers).to.eql(0);
});

runner();
