import Interface from './Interface.js';

export const NORM_ORD = {
  L2: 0,
  L1: 1,
  max: 2,
} as const;
export const NULL = Symbol('null');

export type NormOrdKey = keyof typeof NORM_ORD; // 'L2' | 'L1' | 'max'
type NormOrdValue = typeof NORM_ORD[NormOrdKey]; // 0 | 1 | 2
export type BufferData = Float32Array | Float64Array;
/** @example [1, 2, 3, 4] */
export type Array1d = number[];
/** @example [ [ 1, 2 ], [ 3, 4 ] ] */
export type Array2d = number[][];
export type Data = Array1d | Array2d | BufferData;
export type Shape = number[];
type ShapeWireResult = [rows: number, cols: number, is1d: boolean];
export type InputData = number | Array1d | Array2d | Tensor;
export type OptionalNumber = number | null | undefined;
export type OptionalBool = boolean | undefined;


interface InferedShape {
  _rows: number;
  _cols: number;
  is1d: boolean;
}

export function tensor(data?: Data | typeof NULL, shape?: Shape) : Tensor {
  return new Tensor(data, shape);
};

// a way to override internal checks on data args
// such as "zeros" which just needs a new Tensor of shape
export class Tensor extends Interface {
  private _rows = 0;
  private _cols = 0;
  private is1d = false;
  private keepdims: boolean | null = null;
  protected static scopedInstances: Tensor[] = [];
  protected static inScope = false;
  protected static activePointers = 0;

  constructor(data?: Data | typeof NULL, shape?: Shape, ptr?: OptionalNumber) {
    super();
    if (!data) {
      throw new TypeError('Tensor expects first argument to be an array of data');
    }
    if (shape && !Array.isArray(shape)) {
      throw new TypeError('Shape expects array type');
    }
    this._inferShape(data === NULL ? null : data, shape);
    // Create the tensor in WASM
    this.ptr = ptr ?? this.Module._tensor_create(this._rows, this._cols, this.is1d);
    this._dataPtr = this.Module._tensor_get_data_ptr(this.ptr);
    if (data !== NULL) {
      this.setData(data);
    }
    if (Tensor.inScope) {
      Tensor.scopedInstances.push(this);
    }
    Tensor.activePointers++;
  }

  private wireArgs(data: InputData): InputArgs {
    return new InputArgs(this, data);
  }

  /**
   * Set the data on the instance's buffer
   */
  protected setData(data: Data) {
    const isArray = Array.isArray(data);
    const isTypedArray = ArrayBuffer.isView(data);

    if (!isTypedArray && !isArray) {
      throw new Error("Input must be either Array or TypedArray");
    }
    
    if (isArray && Array.isArray(data[0])) {
      data = (data as Array2d).flat();
    }
    if (data.length !== this._rows * this._cols) {
      throw new Error(`Input data size mismatch: expected ${this._rows * this._cols}, got ${data.length}`);
    }
    // convert valid inputs to Float32Array
    if (isArray || (isTypedArray && !data.isPrototypeOf(Float32Array))) {
      data = new Float32Array(data as Array1d);
    }
    this.Module.HEAPF32.set(data as BufferData, this._dataPtr / Float32Array.BYTES_PER_ELEMENT);
    return this;
  }

  protected _inferShape(data: Data | null, shape?: Shape) {
    if (shape) {
      if (shape.length === 1) {
        this.is1d = true;
      }
      this._rows = this.is1d ? 1 : shape[0];
      this._cols = this.is1d ? shape[0] : shape[1];
    } else if (data) {
      const isTypedArray = ArrayBuffer.isView(data);
      // infer shape from data
      if (isTypedArray) {
        this.is1d = true;
        this._rows = 1;
        this._cols = data.length;
      } else {
        if (!Array.isArray(data[0])) {
          // first item is not an array so this is just a flat array
          this._rows = 1;
          this.is1d = true;
          this._cols = data.length;
        } else {
          // this is a multidimensional array
          this._rows = data.length;
          this._cols = data[0].length;
          // make sure every column is equal size
          for (let i = 1; i < this._rows; i++) {
            if ((data[i] as Array1d).length !== this._cols) {
              throw new Error('Inconsistent columns in data');
            }
          }
        }
      }
    }
  }

  /**
   * Returns the count of active pointers, useful for debugging memory management.
   * @category Performance / Memory
   * @example
   * ft.memory();
   */
  static memory() {
    return {pointers: Tensor.activePointers};
  }

  /**
   * Delete the instance from WASM backend to avoid OOM.
   * @category Performance / Memory
   * @example
   * const mat = tf.ones([2, 2]);
   * // do some things ...
   * const result = mat.data();
   * mat.delete();
   * // accessing "mat" beyond this point is unsafe
   */
  delete() {
    if (!this.deleted) {
      Tensor.activePointers--;
      this.deleted = true;
      this.Module._tensor_delete(this.ptr);
    }
  }

  protected static fromPointer(shape: Shape, is1d: boolean, newPtr: number): Tensor {
    return new Tensor(NULL, is1d ? shape.slice(1) : shape, newPtr);
  }

  /**
   * Start a scope to track any instances created. Should be used with `ft.endScope()`.
   * See ft.scope() for a simpler approach.
   * @category Performance / Memory
   * @example
   * ft.beginScope();
   * const a = tf.ones([2,2]);
   * const b = a.add(2);
   * const result = b.data();
   * ft.endScope();
   * // a and b will have been freed from memory
   */
  static beginScope() {
    Tensor.inScope = true;
  }

  /**
   * End a scope of tracked instances. Should be used with `ft.beginScope()`.
   * See ft.scope() for a simpler approach.
   * @category Performance / Memory
   * @example
   * ft.beginScope();
   * const a = tf.ones([2,2]);
   * const b = a.add(2);
   * const result = b.data();
   * ft.endScope();
   * // a and b will have been freed from memory
   */
  static endScope() {
    Tensor.scope();
  }

  /**
   * Get the shape of the current tensor
   * @category Accessing Data
   * @example
   * const mat = tf.tensor([ [ 1, 2], [ 3, 4 ] ]);
   * const shape = mat.shape; // [2, 2]
   */
  get shape(): Shape {
    if (this.is1d) {
      return [this._cols];
    }
    return [this._rows, this._cols];
  }

  /**
   * Get the number of rows of the current tensor
   * @category Accessing Data
   * @example
   * const mat = tf.tensor([ [ 1 ], [ 2 ] ]);
   * const cols = mat.rows; // 2
   */
  get rows() {
    return this._rows;
  }

  /**
   * Get the number of columns of the current tensor
   * @category Accessing Data
   * @example
   * const mat = tf.tensor([ [ 1 ], [ 2 ] ]);
   * const cols = mat.cols; // 1
   */
  get cols() {
    return this._cols;
  }

  private _syncShapeWire(shapeWire: ShapeWire) {
    const result: ShapeWireResult = shapeWire.sync();
    this._rows = result[0];
    this._cols = result[1];
    this.is1d = result[2];
  }

  /**
   * Start a scope to track any instances created, will automatically
   * clear out any references not returned.
   * @category Performance / Memory
   * @example
   * ft.scope(() => {
   *  const a = tf.ones([2,2]);
   *  const b = a.add(2);
   *  const result = b.data();
   *  return result;
   * });
   * // "a" and "b" will have been freed from memory
   * @example
   * const result = ft.scope(() => {
   *  const a = tf.ones([2,2]);
   *  const b = a.add(2);
   *  return b;
   * });
   * // only "a" will have been freed from memory
   * // you will need to manually delete the instance
   * result.delete();
   */
  static scope(callback?: () => unknown): unknown {
    const { Module } = Tensor;
    Tensor.inScope = true;
    let err;
    let result: unknown;
    try {
      if (typeof callback === 'function') {
        result = callback();
      }
    } catch (_err) {
      err = _err;
    }
    Tensor.inScope = false;
    // capture all pointers found in scope and tombstone them
    const captured = [];
    for (const mat of Tensor.scopedInstances) {
      if (mat !== result && !mat.deleted) {
        captured.push(mat.ptr);
        // reset pointer and mark as deleted
        mat.ptr = 0;
        mat.deleted = true;
        Tensor.activePointers--;
      }
    }
    // Allocate space for the tombstones and build input
    const count = captured.length;
    const tombstones = new Uint32Array(captured);
    const tombPtr = Module._malloc(count * tombstones.BYTES_PER_ELEMENT);
    Tensor.Module.HEAPU32.set(tombstones, tombPtr / Uint32Array.BYTES_PER_ELEMENT);
    let internalError;
    try {
      // clear them out
      Module._tensor_batch_delete(tombPtr, count);
      Module._free(tombPtr);
    } catch (e) {
      internalError = e;
    } finally {
      // reset scope
      Tensor.scopedInstances = [];
    }
    // handle errors
    if (internalError) {
      // TODO add better error handling here for when there are multiple errors
      // eslint-disable-next-line
      console.error(internalError);
    }
    if (err) {
      throw err;
    }
    return result;
  }

  /**
   * Deep copy the current tensor
   * @category Creation
   * @example
   * const mat = ft.tensor([1, 2]);
   * const clone = mat.clone();
   */
  clone() {
    const newPtr = this.Module._tensor_clone(this.ptr);
    const mat = Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
    return mat;
  }

  /**
   * @category Transformations
   */
  reshape(shapeOrRows: number | Shape, cols?: number): Tensor {
    let rows;
    if (Array.isArray(shapeOrRows)) {
      [rows, cols] = shapeOrRows;
    } else {
      rows = shapeOrRows;
    }
    cols ??= -2;
    const shapeWire = new ShapeWire();
    const newPtr = this.Module._tensor_reshape(this.ptr, rows, cols, shapeWire.ptr);
    const mat = Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
    mat._syncShapeWire(shapeWire);
    return mat;
  }

  /**
   * @category Transformations
   */
  flatten(): Tensor {
    const newPtr = this.Module._tensor_flatten(this.ptr);
    const mat = Tensor.fromPointer([1, this._rows * this._cols], true, newPtr);
    return mat;
  }

  /**
   * Add a tensor or scalar, a + b.
   * @broadcast
   * @category Arithmetic
   * @example
   * // scalar
   * const mat = ft.tensor([1, 2, 3, 4]).add(2);
   * // tensor
   * ft.tensor([1, 2, 3, 4]).add(mat);
   */
  add(input: InputData): Tensor {
    const args = this.wireArgs(input);
    const newPtr = this.Module._tensor_add(this.ptr, args.ptr, args.size);
    args.free();
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /**
   * Subtract a tensor or scalar element-wise, a - b.
   * @broadcast
   * @category Arithmetic
   * @example
   * // scalar
   * const mat = ft.tensor([1, 2, 3, 4]).sub(2);
   * // tensor
   * ft.tensor([1, 2, 3, 4]).sub(mat);
   */
  sub(input: InputData): Tensor {
    const args = this.wireArgs(input);
    const newPtr = this.Module._tensor_sub(this.ptr, args.ptr, args.size);
    args.free();
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /**
   * Multiply a tensor or scalar element-wise, a * b.
   * @broadcast
   * @category Arithmetic
   * @example
   * // scalar
   * const mat = ft.tensor([1, 2, 3, 4]).mul(2);
   * // tensor
   * ft.tensor([1, 2, 3, 4]).mul(mat);
   */
  mul(input: InputData): Tensor {
    const args = this.wireArgs(input);
    const newPtr = this.Module._tensor_mul(this.ptr, args.ptr, args.size);
    args.free();
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /**
   * Divides a tensor or scalar element-wise, a / b.
   * @broadcast
   * @category Arithmetic
   * @example
   * // scalar
   * const mat = ft.tensor([1, 2, 3, 4]).div(2);
   * // tensor
   * ft.tensor([1, 2, 3, 4]).div(mat);
   */
  div(input: InputData, noNan = false): Tensor {
    const args = this.wireArgs(input);
    const newPtr = this.Module._tensor_div(this.ptr, !!noNan, args.ptr, args.size);
    args.free();
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /**
   * Divide a tensor or scalar element-wise, a / b. Return 0 (instead of NaN) if denominator is 0.
   * @broadcast
   * @category Arithmetic
   * @example
   * // scalar
   * const mat = ft.tensor([1, 2, 3, 4]).divNoNan(2);
   * // tensor
   * ft.tensor([1, 2, 3, 4]).divNoNan(mat);
   */
  divNoNan(input: InputData): Tensor {
    return this.div(input, true);
  }

  /**
   * Max of a and b (a > b ? a : b) element-wise.
   * @broadcast
   * @category Arithmetic
   * @example
   * // scalar
   * const mat = ft.tensor([1, 2, 3, 4]).maximum(2);
   * // tensor
   * ft.tensor([1, 3, 4, 5]).maximum(mat);
   */
  maximum(input: InputData): Tensor {
    const args = this.wireArgs(input);
    const newPtr = this.Module._tensor_maximum(this.ptr, args.ptr, args.size);
    args.free();
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /**
   * Min of a and b (a < b ? a : b) element-wise.
   * @broadcast
   * @category Arithmetic
   * @example
   * // scalar
   * const mat = ft.tensor([1, 2, 3, 4]).minimum(2);
   * // tensor
   * ft.tensor([0, 1, 2, 3]).minimum(mat);
   */
  minimum(input: InputData): Tensor {
    const args = this.wireArgs(input);
    const newPtr = this.Module._tensor_minimum(this.ptr, args.ptr, args.size);
    args.free();
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /**
   * Modulo of a and b element-wise, a % b.
   * @broadcast
   * @category Arithmetic
   * @example
   * // scalar
   * const mat = ft.tensor([1, 2, 3, 4]).mod(2);
   * // tensor
   * ft.tensor([2, 4, 6, 8]).mod(mat);
   */
  mod(input: InputData): Tensor {
    const args = this.wireArgs(input);
    const newPtr = this.Module._tensor_mod(this.ptr, args.ptr, args.size);
    args.free();
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /**
   * Power of a and b element-wise, a^b.
   * @broadcast
   * @category Arithmetic
   * @example
   * // scalar
   * const mat = ft.tensor([1, 2, 3, 4]).pow(2);
   * // tensor
   * ft.tensor([0, 1, 2, 3]).pow(mat);
   */
  pow(input: InputData): Tensor {
    const args = this.wireArgs(input);
    const newPtr = this.Module._tensor_pow(this.ptr, args.ptr, args.size);
    args.free();
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /**
   * Squared difference of a and b element-wise, (a - b) * (a - b).
   * @broadcast
   * @category Arithmetic
   * @example
   * // scalar
   * const mat = ft.tensor([1, 2, 3, 4]).squaredDifference(2);
   * // tensor
   * ft.tensor([0, 1, 2, 3]).squaredDifference(mat);
   */
  squaredDifference(input: InputData): Tensor {
    const args = this.wireArgs(input);
    const newPtr = this.Module._tensor_squared_diff(this.ptr, args.ptr, args.size);
    args.free();
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /** @category Basic Math */
  abs(): Tensor {
    const newPtr = this.Module._tensor_abs(this.ptr);
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /** @category Basic Math */
  acos(): Tensor {
    const newPtr = this.Module._tensor_acos(this.ptr);
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /** @category Basic Math */
  acosh(): Tensor {
    const newPtr = this.Module._tensor_acosh(this.ptr);
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /** @category Basic Math */
  asin(): Tensor {
    const newPtr = this.Module._tensor_asin(this.ptr);
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /** @category Basic Math */
  asinh(): Tensor {
    const newPtr = this.Module._tensor_asinh(this.ptr);
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /** @category Basic Math */
  atan(): Tensor {
    const newPtr = this.Module._tensor_atan(this.ptr);
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /** @category Basic Math */
  atan2(input: InputData): Tensor {
    const args = this.wireArgs(input);
    const newPtr = this.Module._tensor_atan2(this.ptr, args.ptr, args.size);
    args.free();
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /** @category Basic Math */
  atanh(): Tensor {
    const newPtr = this.Module._tensor_atanh(this.ptr);
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /** @category Basic Math */
  ceil(): Tensor {
    const newPtr = this.Module._tensor_ceil(this.ptr);
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /** @category Basic Math */
  clipByValue(lower: number, upper: number): Tensor {
    if (typeof lower !== 'number' || typeof upper !== 'number') {
      throw new TypeError('clipByValue expects args (lower<number>, upper<number>)');
    }
    const newPtr = this.Module._tensor_clip(this.ptr, lower, upper);
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /** @category Basic Math */
  cos(): Tensor {
    const newPtr = this.Module._tensor_cos(this.ptr);
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /** @category Basic Math */
  cosh(): Tensor {
    const newPtr = this.Module._tensor_cosh(this.ptr);
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /** @category Basic Math */
  floor(): Tensor {
    const newPtr = this.Module._tensor_floor(this.ptr);
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /** @category Basic Math */
  square(): Tensor {
    const newPtr = this.Module._tensor_square(this.ptr);
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /**
   * Returns the logical "and" of values along an axis.
   * @category Reduction
   */
  all(axis: OptionalNumber = -1, keepdims: OptionalBool = false): Tensor {
    // if null change to -1
    axis ??= -1;
    if (this.is1d && axis > -1) {
      throw new Error('Attempting to perform op on a 1d array with axis, remove axis');
    }
    const shapeWire = new ShapeWire();
    const newPtr = this.Module._tensor_all(this.ptr, axis, keepdims, shapeWire.ptr);
    const mat = Tensor.fromPointer([this._rows, this._cols], axis < 0, newPtr);
    mat._syncShapeWire(shapeWire);
    mat.keepdims = keepdims;
    return mat;
  }

  /**
   * Returns the logical "or" of values along an axis.
   * @category Reduction
   */
  any(axis: OptionalNumber = -1, keepdims: OptionalBool = false): Tensor {
    // if null change to -1
    axis ??= -1;
    if (this.is1d && axis > -1) {
      throw new Error('Attempting to perform op on a 1d array with axis, remove axis');
    }
    const shapeWire = new ShapeWire();
    const newPtr = this.Module._tensor_any(this.ptr, axis, keepdims, shapeWire.ptr);
    const mat = Tensor.fromPointer([this._rows, this._cols], axis < 0, newPtr);
    mat._syncShapeWire(shapeWire);
    mat.keepdims = keepdims;
    return mat;
  }

  /**
   * Returns the indices of the maximum values along an axis.
   * @category Reduction
   */
  argMax(axis: OptionalNumber = 0): Tensor {
    // if null change to 0
    axis ??= 0;
    if (this.is1d && axis !== 0) {
      throw new Error(`argMax received axis=${axis} on 1d array, remove axis`);
    } else if (!this.is1d && (axis < 0 || axis > 1)) {
      throw new Error(`argMax expects axis to be 0 or 1`);
    }
    const shapeWire = new ShapeWire();
    const newPtr = this.Module._tensor_arg_max(this.ptr, axis, shapeWire.ptr);
    const mat = Tensor.fromPointer([this._rows, this._cols], axis < 0, newPtr);
    mat._syncShapeWire(shapeWire);
    mat.keepdims = false;
    return mat;
  }

  /**
   * Returns the indices of the minimum values along an axis.
   * @category Reduction
   */
  argMin(axis: OptionalNumber = 0): Tensor {
    // if null change to 0
    axis ??= 0;
    if (this.is1d && axis !== 0) {
      throw new Error(`argMin received axis=${axis} on 1d array, remove axis`);
    } else if (!this.is1d && (axis < 0 || axis > 1)) {
      throw new Error(`argMin expects axis to be 0 or 1`);
    }
    const shapeWire = new ShapeWire();
    const newPtr = this.Module._tensor_arg_min(this.ptr, axis, shapeWire.ptr);
    const mat = Tensor.fromPointer([this._rows, this._cols], axis < 0, newPtr);
    mat._syncShapeWire(shapeWire);
    mat.keepdims = false;
    return mat;
  }

  /**
   * Computes the maximum of all elements across the axis
   * @category Reduction 
   */
  max(axis: OptionalNumber = -1, keepdims: OptionalBool = false): Tensor {
    // if null change to -1
    axis ??= -1;
    if (this.is1d && axis > -1) {
      throw new Error('Attempting to perform max on a 1d array with axis, remove axis');
    }
    const shapeWire = new ShapeWire();
    const newPtr = this.Module._tensor_max(this.ptr, axis, keepdims, shapeWire.ptr);
    const mat = Tensor.fromPointer([this._rows, this._cols], axis < 0, newPtr);
    mat._syncShapeWire(shapeWire);
    mat.keepdims = keepdims;
    return mat;
  }

  /**
   * Computes the mean of all elements across the axis
   * @category Reduction 
   */
  mean(axis: OptionalNumber = -1, keepdims: OptionalBool = false): Tensor {
    // if null change to -1
    axis ??= -1;
    if (this.is1d && axis > -1) {
      throw new Error('Attempting to mean a 1d array with axis, remove axis');
    }
    const shapeWire = new ShapeWire();
    const newPtr = this.Module._tensor_mean(this.ptr, axis, keepdims, shapeWire.ptr);
    const mat = Tensor.fromPointer([this._rows, this._cols], axis < 0, newPtr);
    mat._syncShapeWire(shapeWire);
    mat.keepdims = keepdims;
    return mat;
  }

  /**
   * Computes the minimum of all elements across the axis
   * @category Reduction 
   */
  min(axis: OptionalNumber = -1, keepdims: OptionalBool = false): Tensor {
    // if null change to -1
    axis ??= -1;
    if (this.is1d && axis > -1) {
      throw new Error('Attempting to perform min on a 1d array with axis, remove axis');
    }
    const shapeWire = new ShapeWire();
    const newPtr = this.Module._tensor_min(this.ptr, axis, keepdims, shapeWire.ptr);
    const mat = Tensor.fromPointer([this._rows, this._cols], axis < 0, newPtr);
    mat._syncShapeWire(shapeWire);
    mat.keepdims = keepdims;
    return mat;
  }

  /**
   * Computes the product of all elements across the axis
   * @category Reduction 
   */
  prod(axis: OptionalNumber = -1, keepdims: OptionalBool = false): Tensor {
    // if null change to -1
    axis ??= -1;
    if (this.is1d && axis > -1) {
      throw new Error('Attempting to perform prod on a 1d array with axis, remove axis');
    }
    const shapeWire = new ShapeWire();
    const newPtr = this.Module._tensor_prod(this.ptr, axis, keepdims, shapeWire.ptr);
    const mat = Tensor.fromPointer([this._rows, this._cols], axis < 0, newPtr);
    mat._syncShapeWire(shapeWire);
    mat.keepdims = keepdims;
    return mat;
  }

  /**
   * Computes the sum of all elements across the axis
   * @category Reduction 
   */
  sum(axis: OptionalNumber = -1, keepdims: OptionalBool = false): Tensor {
    // if null change to -1
    axis ??= -1;
    if (this.is1d && axis > -1) {
      throw new Error('Attempting to perform sum on a 1d array with axis, remove axis');
    }
    const shapeWire = new ShapeWire();
    const newPtr = this.Module._tensor_sum(this.ptr, axis, keepdims, shapeWire.ptr);
    const mat = Tensor.fromPointer([this._rows, this._cols], axis < 0, newPtr);
    mat._syncShapeWire(shapeWire);
    mat.keepdims = keepdims;
    return mat;
  }

  /**
   * @category Matrices
   */
  norm(
    ord: NormOrdKey | null | undefined = 'L2',
    axis: OptionalNumber = -1, 
    keepdims: OptionalBool = false
  ): Tensor {
    // if null change to -1
    axis ??= -1;
    if (this.is1d && axis > -1) {
      throw new Error('Attempting to norm a 1d array with axis, remove axis');
    }
    // default is L2
    const ordEnum: NormOrdValue = ord ? NORM_ORD[ord] : 0;
    const shapeWire = new ShapeWire();
    const newPtr = this.Module._tensor_norm(this.ptr, ordEnum, axis, keepdims, shapeWire.ptr);
    const mat = Tensor.fromPointer([this._rows, this._cols], axis < 0, newPtr);
    mat._syncShapeWire(shapeWire);
    mat.keepdims = keepdims;
    return mat;
  }

  /** @category Linear Algebra */
  qr(): [Tensor, Tensor] {
    const Q = Tensor.eye([this._rows, this._rows]); // Square matrix
    const newPtr = this.Module._tensor_qr(this.ptr, Q.ptr);
    const R = Tensor.fromPointer([this._rows, this._cols], false, newPtr);
    return [Q, R];
  }

  // TODO move shapewire ptr to 2nd arg (standardize)
  /**
   * @category Matrices
   */
  matMul(tensor: Tensor): Tensor {
    if (!(tensor instanceof Tensor)) {
      throw new TypeError('Expected 1st argument to be of type Tensor');
    }
    const shapeWire = new ShapeWire();
    const newPtr = this.Module._tensor_matmul(this.ptr, tensor.ptr, shapeWire.ptr);
    const mat = Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
    mat._syncShapeWire(shapeWire);
    return mat;
  }

  /**
   * @category Slicing And Joining
   */
  reverse(axis: OptionalNumber = -1): Tensor {
    // if null change to -1
    axis ??= -1;
    if (this.is1d && axis > -1) {
      throw new Error('Attempting to norm a 1d array with axis, remove axis');
    }
    const newPtr = this.Module._tensor_reverse(this.ptr, axis);
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  /**
   * @category Matrices
   */
  transpose(): Tensor {
    if (this.is1d) {
      throw new Error('Attempting to transpose a 1d array, reshape to [1,n] first');
    }
    const newPtr = this.Module._tensor_transpose(this.ptr);
    // swap order of columns and rows
    return Tensor.fromPointer([this._cols, this._rows], false, newPtr);
  }

  /**
   * @category Slicing And Joining
   */
  static stack(matrices: Tensor[]): Tensor {
    const ptrs = matrices.map(m => m.ptr);
    // create a reference of data pointers that we can access on C side
    const count = ptrs.length;
    const instancePtrs = new Uint32Array(ptrs);
    const refPtr = Tensor.Module._malloc(count * instancePtrs.BYTES_PER_ELEMENT);
    Tensor.Module.HEAPU32.set(instancePtrs, refPtr / Uint32Array.BYTES_PER_ELEMENT);
    const newPtr = Tensor.Module._tensor_stack(refPtr, count);
    Tensor.Module._free(refPtr);
    const { rows, cols } = matrices[0];
    return Tensor.fromPointer([rows * matrices.length, cols], false, newPtr);
  }

  /**
   * @category Creation
   * @example
   * const mat = ft.tensor([ [ 1, 2 ], [ 3, 4 ] ]);
   * const diag = mat.diag();
   */
  diag(): Tensor {
    if (!this.is1d) {
      throw new Error('Tensor.diag expects a 1d array, flatten before calling');
    }
    const shapeWire = new ShapeWire();
    const newPtr = this.Module._tensor_diag(this.ptr, shapeWire.ptr);
    const mat = Tensor.fromPointer([this._rows, this._cols], false, newPtr);
    mat._syncShapeWire(shapeWire);
    return mat;
  }

  /** @hidden */
  static zeros(shape: Shape): Tensor {
    const s = {} as InferedShape;
    Tensor.prototype._inferShape.call(s, null, shape);
    shape = [s._rows, s._cols] as Shape;
    return new Tensor(NULL, s.is1d ? shape.slice(1) : shape);
  }

  /**
   * @category Creation
   * @example
   * const zeros = ft.zeros([2, 2]);
   * // also can be used on an instance
   * const mat = ft.tensor([1, 2, 3, 4]);
   * const matZeros = mat.zeros();
   */
  zeros(): Tensor {
    const shape = [this._rows, this._cols];
    return new Tensor(NULL, this.is1d ? shape.slice(1) : shape); 
  }

  /** @hidden */
  static ones(shape: Shape): Tensor {
    const s = {} as InferedShape;
    Tensor.prototype._inferShape.call(s, null, shape);
    shape = [s._rows, s._cols] as Shape;
    const data = Array(s._rows * s._cols).fill(1);
    return new Tensor(data, s.is1d ? shape.slice(1) : shape);
  }

  /**
   * @category Creation
   * @example
   * const ones = ft.ones([2, 2]);
   * // also can be used on an instance
   * const mat = ft.tensor([1, 2, 3, 4]);
   * const matOnes = mat.ones();
   */
  ones(): Tensor {
    const data = Array(this._rows * this._cols).fill(1);
    const shape = [this._rows, this._cols];
    return new Tensor(new Float32Array(data), this.is1d ? shape.slice(1) : shape);
  }

  /** @hidden */
  static eye(shape: Shape): Tensor {
    const s = {} as InferedShape;
    Tensor.prototype._inferShape.call(s, null, shape);
    const {_rows, _cols} = s;
    if (s.is1d) {
      throw new Error('Attempting to create identity with 1d shape');
    }
    const eye = new Float32Array(_rows * _cols);
    for (let i = 0; i < _cols; i++) {
     eye[i * _cols + i] = 1.0;
    }
    return new Tensor(eye, [_rows, _cols]);
  }

  /**
   * @category Creation
   * @example
   * const eye = ft.eye([2, 2]);
   * // also can be used on an instance
   * const mat = ft.tensor([ [ 1, 2 ], [ 3, 4 ] ]);
   * const matEye = mat.eye();
   */
  eye(): Tensor {
    if (this.is1d) {
      throw new Error('Attempting to create identity with 1d shape');
    }
    const newPtr = this.Module._tensor_eye(this.ptr);
    return Tensor.fromPointer([this._cols, this._rows], false, newPtr);
  }

  /**
   * @category Transformations
   */
  pad(paddings: Array1d | Array2d, constant?: number): Tensor {
    if (this.is1d && Array.isArray(paddings[0])) {
      throw new Error('Attempting to pad rows with 1d shape');
    }
    let rows, cols;
    let rbefore, rafter;
    let cbefore, cafter;

    if (this.is1d) {
      [cbefore, cafter] = paddings as number[];
    } else {
      [rows, cols] = paddings as number[][];
      [rbefore, rafter] = rows;
      if (Array.isArray(cols)) {
        [cbefore, cafter] = cols;
      }
    }

    const shapeWire = new ShapeWire();
    const newPtr = this.Module._tensor_pad(
      this.ptr, 
      shapeWire.ptr,
      constant ?? 0, 
      rbefore ?? 0, 
      rafter ?? 0,
      cbefore ?? 0, 
      cafter ?? 0
    );
    const mat = Tensor.fromPointer([this._cols, this._rows], this.is1d, newPtr);
    mat._syncShapeWire(shapeWire);
    return mat;
  }

  /**
   * Access the raw typed array from wasm memory, useful for in-place operations.
   * @category Accessing Data
   * @example
   * const mat = tf.tensor([1, 2, 3, 4]);
   * const buf = mat.buffer();
   */
  buffer() {
    if (this.deleted) {
      throw new RangeError('Accessing deleted Tensor');
    }
    const result = new Float32Array(
      this.Module.HEAPF32.buffer,
      this._dataPtr,
      this._rows * this._cols
    );

    return result;
  }

  /**
   * Retrieve a copy of the data into a new buffer
   * @category Accessing Data
   * @example
   * const mat = tf.tensor([1, 2, 3, 4]);
   * const data = mat.data();
   */
  data() {
    if (this.deleted) {
      throw new RangeError('Accessing deleted Tensor');
    }
    return new Float32Array(
      Tensor.Module.HEAPF32.subarray(
        this._dataPtr / Float32Array.BYTES_PER_ELEMENT,
        this._dataPtr / Float32Array.BYTES_PER_ELEMENT + this._rows * this._cols
      )
    );
  }

  /**
   * Retrieve a copy of the data into a new Array with same shape
   * @category Accessing Data
   * @example
   * const mat = tf.tensor([ [ 1, 2 ], [ 3, 4 ] ]);
   * const arr = mat.array();
   */
  array() : number | Array1d | Array2d {
    if (this.deleted) {
      throw new RangeError('Accessing deleted Tensor');
    }
    const data = this.buffer();
    if (this.is1d) {
      if (this.keepdims === false) {
        return data[0];
      }
      // 1D Array
      return Array.from(data);
    } else if (this.keepdims === false) {
      return Array.from(data);
    }
    const {rows, cols} = this;
    //const size = this._cols * this._rows;
    const result: Array1d | Array2d = Array(rows);
    for (let r = 0; r < rows; r++) {
      const row = result[r] = Array(cols);
      for (let c = 0; c < cols; c++) {
        row[c] = data[r * cols + c];
      }
    }
    return result;
  }

  /** @hidden */
  bounds() {
    // Define a buffer size matching the `Bounds` struct (4 doubles)
    const boundsBufferSize = 4 * Float32Array.BYTES_PER_ELEMENT;
    // Allocate memory for the bounds struct
    const boundsPtr = this.Module._malloc(boundsBufferSize);
    // Call the WASM function to compute bounds
    this.Module._tensor_get_bounds(this.ptr, boundsPtr);
    // Read the bounds data from WASM memory
    const boundsArray = new Float32Array(
      this.Module.HEAPF32.buffer,
      boundsPtr,
      4
    );
    // Free the memory for the bounds struct
    this._free(boundsPtr);
    // Return bounds as an object
    return {
      xmin: boundsArray[0],
      ymin: boundsArray[1],
      xmax: boundsArray[2],
      ymax: boundsArray[3],
    };
  }
}

/**
 * Used to receive shape synchronously with shape changing calls
 * where the shape cannot be inferred
 */
class ShapeWire {
  static bufferSize = 3 * Int32Array.BYTES_PER_ELEMENT;
  ptr: number;

  constructor() {
    this.ptr = Tensor.Module._malloc(ShapeWire.bufferSize);
  }
  /**
   * When creating a copy we need to sync the new tensor
   * otherwise we use the instanced one
   */
  sync(): ShapeWireResult {
    const shapeArray = new Int32Array(
      Tensor.Module.HEAP32.buffer,
      this.ptr,
      3
    );
    const result: ShapeWireResult = [
      shapeArray[0],
      shapeArray[1],
      Boolean(shapeArray[2]),
    ];
    // Free the memory and update the tensor
    Tensor.Module._free(this.ptr);
    return result;
  }
}

class InputArgs {
  private isOwned: boolean;
  private tensor: Tensor;
  size: number;
  ptr: number;

  constructor(tensor: Tensor, input: InputData) {
    this.isOwned = false;
    this.tensor = tensor;

    if (input instanceof Interface) {
      this.isOwned = true;
      this.size = input.rows * input.cols;
      this.ptr = input.dataPtr;
    } else {
      const isScalar = typeof input === 'number';
      const array = isScalar ? [input] : input;
      const data = new Float32Array(array as Array1d);
      this.size = data.length;
      this.ptr = tensor.Module._malloc(this.size * data.BYTES_PER_ELEMENT);
      tensor.Module.HEAPF32.set(data, this.ptr / Float32Array.BYTES_PER_ELEMENT);
    }
  }

  free(): void {
    // Don't free ptr if it's owned
    if (this.isOwned) {
      return;
    }
    this.tensor.Module._free(this.ptr);
  }
}
