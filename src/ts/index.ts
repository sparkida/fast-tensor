import { tensor, Tensor } from './Tensor.js';
import { Kalman } from './Kalman.js';

const scope = Tensor.scope;
const beginScope = Tensor.beginScope;
const endScope = Tensor.endScope;
const index = {
  tensor,
  Tensor,
  Kalman,
  scope,
  beginScope,
  endScope,
};
export {
  tensor,
  scope,
  beginScope,
  endScope,
  Tensor,
  Kalman,
  index as default
};
