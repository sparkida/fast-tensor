import { tensor, Tensor } from './Tensor.js';
import { Kalman } from './Kalman.js';
import Interface from './Interface.js';

const scope = Tensor.scope;
const beginScope = Tensor.beginScope;
const endScope = Tensor.endScope;
const ready = Interface.ready;
const setWasmPath = Interface.setWasmPath;

// Consolidated Default Export
const index = {
  tensor,
  Tensor,
  Kalman,
  scope,
  beginScope,
  endScope,
  ready,
  setWasmPath,
};

export { tensor, Tensor, Kalman, scope, beginScope, endScope, ready, setWasmPath };
export default index;

// Type Exports (ESM and TypeDoc Friendly)
export type * from './Tensor.js';
export type * from './Kalman.js';
