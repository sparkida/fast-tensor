import * as ft from '@src/index.js'; 
import { expect } from 'chai';

globalThis.expect = expect;
globalThis.Tensor = ft.Tensor;
globalThis.ft = ft;
