import { Tensor } from '@src/Tensor.js';
import { expect } from 'chai';

declare global {
  var Tensor: typeof Tensor; // Declare the type for Tensor
  var expect: typeof expect; // Declare the type for expect
}

export {}; // Ensures this file is treated as a module

