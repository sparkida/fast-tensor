import Interface from './Interface.js';

export const NORM_ORD = {
  L2: 0,
  L1: 1,
  max: 2,
} as const;

type NormOrdKey = keyof typeof NORM_ORD; // 'L2' | 'L1' | 'max'
type NormOrdValue = typeof NORM_ORD[NormOrdKey]; // 0 | 1 | 2

const NULL = Symbol('null');
type BufferData = Float32Array | Float64Array;
type Array1d = number[];
type Array2d = number[][];
type Data = Array1d | Array2d | BufferData;
type Shape = number[];
type ShapeWireResult = [rows: number, cols: number, is1d: boolean];
type InputData = number | Array1d | Array2d | Tensor;
type OptionalNumber = number | null | undefined;
type OptionalBool = boolean | undefined;

interface InferedShape {
  _rows: number;
  _cols: number;
  is1d: boolean;
}

// a way to override internal checks on data args
// such as "zeros" which just needs a new Tensor of shape
export class Tensor extends Interface {
  protected static scopedInstances: Tensor[] = [];
  protected static inScope = false;
  protected static activePointers = 0;
  private _rows = 0;
  private _cols = 0;
  private is1d = false;
  private keepdims: boolean | null = null;

  constructor(data?: Data | typeof NULL, shape?: Shape, ptr?: number) {
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

  setData(data: Data) {
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

  _inferShape(data: Data | null, shape?: Shape) {
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

  static memory() {
    return {pointers: Tensor.activePointers};
  }

  delete() {
    if (!this.deleted) {
      Tensor.activePointers--;
      this.deleted = true;
      this.Module._tensor_delete(this.ptr);
    }
  }

  static fromPointer(shape: Shape, is1d: boolean, newPtr: number): Tensor {
    return new Tensor(NULL, is1d ? shape.slice(1) : shape, newPtr);
  }

  static beginScope() {
    Tensor.inScope = true;
  }

  static endScope() {
    Tensor.scope();
  }

  get shape(): Shape {
    if (this.is1d) {
      return [this._cols];
    }
    return [this._rows, this._cols];
  }

  get rows() {
    return this._rows;
  }

  get cols() {
    return this._cols;
  }

  private _syncShapeWire(shapeWire: ShapeWire) {
    const result: ShapeWireResult = shapeWire.sync();
    this._rows = result[0];
    this._cols = result[1];
    this.is1d = result[2];
  }


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

  // Create a new tensor from current
  clone() {
    const newPtr = this.Module._tensor_clone(this.ptr);
    const mat = Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
    return mat;
  }

  reshape(shapeOrRows: number | Shape, cols?: number): Tensor {
    let rows;
    if (Array.isArray(shapeOrRows)) {
      [rows, cols] = shapeOrRows;
    } else {
      rows = shapeOrRows;
    }
    const shapeWire = new ShapeWire();
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const newPtr = this.Module._tensor_reshape(this.ptr, rows, cols!, shapeWire.ptr);
    const mat = Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
    mat._syncShapeWire(shapeWire);
    return mat;
  }

  flatten(): Tensor {
    const newPtr = this.Module._tensor_flatten(this.ptr);
    const mat = Tensor.fromPointer([1, this._rows * this._cols], true, newPtr);
    return mat;
  }

  add(input: InputData): Tensor {
    const args = this.wireArgs(input);
    const newPtr = this.Module._tensor_add(this.ptr, args.ptr, args.size);
    args.free();
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  sub(input: InputData): Tensor {
    const args = this.wireArgs(input);
    const newPtr = this.Module._tensor_sub(this.ptr, args.ptr, args.size);
    args.free();
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  mul(input: InputData): Tensor {
    const args = this.wireArgs(input);
    const newPtr = this.Module._tensor_mul(this.ptr, args.ptr, args.size);
    args.free();
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  div(input: InputData): Tensor {
    const args = this.wireArgs(input);
    const newPtr = this.Module._tensor_div(this.ptr, args.ptr, args.size);
    args.free();
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  square(): Tensor {
    const newPtr = this.Module._tensor_square(this.ptr);
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  mean(axis: OptionalNumber = -1, keepdims: OptionalBool = false): Tensor {
    // if null change to -1
    axis ??= -1;
    if (this.is1d && axis > -1) {
      throw new Error('Attempting to norm a 1d array with axis, remove axis');
    }
    const shapeWire = new ShapeWire();
    const newPtr = this.Module._tensor_mean(this.ptr, axis, keepdims, shapeWire.ptr);
    const mat = Tensor.fromPointer([this._rows, this._cols], axis < 0, newPtr);
    mat._syncShapeWire(shapeWire);
    mat.keepdims = keepdims;
    return mat;
  }

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

  // TODO move shapewire ptr to 2nd arg (standardize)
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

  reverse(axis: OptionalNumber = -1): Tensor {
    // if null change to -1
    axis ??= -1;
    if (this.is1d && axis > -1) {
      throw new Error('Attempting to norm a 1d array with axis, remove axis');
    }
    const newPtr = this.Module._tensor_reverse(this.ptr, axis);
    return Tensor.fromPointer([this._rows, this._cols], this.is1d, newPtr);
  }

  transpose(): Tensor {
    if (this.is1d) {
      throw new Error('Attempting to transpose a 1d array, reshape to [1,n] first');
    }
    const newPtr = this.Module._tensor_transpose(this.ptr);
    // swap order of columns and rows
    return Tensor.fromPointer([this._cols, this._rows], false, newPtr);
  }

  static zeros(shape: Shape): Tensor {
    const s = {} as InferedShape;
    Tensor.prototype._inferShape.call(s, null, shape);
    shape = [s._rows, s._cols] as Shape;
    return new Tensor(NULL, s.is1d ? shape.slice(1) : shape);
  }

  static ones(shape: Shape): Tensor {
    const s = {} as InferedShape;
    Tensor.prototype._inferShape.call(s, null, shape);
    shape = [s._rows, s._cols] as Shape;
    const data = Array(s._rows * s._cols).fill(1);
    return new Tensor(data, s.is1d ? shape.slice(1) : shape);
  }

  static identity(shape: Shape): Tensor {
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

  zeros(): Tensor {
    const shape = [this._rows, this._cols];
    return new Tensor(NULL, this.is1d ? shape.slice(1) : shape); 
  }

  ones(): Tensor {
    const data = Array(this._rows * this._cols).fill(1);
    const shape = [this._rows, this._cols];
    return new Tensor(new Float32Array(data), this.is1d ? shape.slice(1) : shape);
  }

  identity(): Tensor {
    if (this.is1d) {
      throw new Error('Attempting to create identity with 1d shape');
    }
    const newPtr = this.Module._tensor_identity(this.ptr);
    return Tensor.fromPointer([this._cols, this._rows], false, newPtr);
  }

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

  // return raw typed array from wasm memory
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

  // return data copied from buffer
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

  // return extrpolated data from buffer
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
export class ShapeWire {
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


