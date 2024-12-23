import * as ft from '@src/index.js';
import { expect } from 'chai';

declare global {
  var ft: typeof ft;
  var Tensor: typeof ft.Tensor; // Declare the type for Tensor
  var expect: typeof expect; // Declare the type for expect
}

export {}; // Ensures this file is treated as a module

