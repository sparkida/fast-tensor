import { tensor, Tensor } from './Tensor.js';
import { Kalman } from './Kalman.js';
import Interface from './Interface.js';
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const isNode = typeof process !== 'undefined' && process.versions?.node !== null;

if (isNode) {
  // bootstrap the WASM immediately for NodeJS env
  void Interface.ready();
}
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
