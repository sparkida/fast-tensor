import Interface from './Interface.js';

export class Kalman extends Interface {
  initialized = false;
  bufferSize = 0;

  constructor(q = 0.1, r = 1) {
    super();
    // Create the matrix in WASM
    this.ptr = this.Module._kalman_create(q, r);
  }

  /**
   * Update observation with ability to use different q,r
   * Using a different q,r will only apply to current update
   */
  update(data: Float32Array, qTemp = -1, rTemp = -1) {
    if (!(data instanceof Float32Array)) {
      throw new Error("Input must be a Float32Array");
    }
    if (!this.initialized) {
      this.initialized = true;
      this.bufferSize = data.length * Float32Array.BYTES_PER_ELEMENT;
      this._dataPtr = this.Module._malloc(this.bufferSize);
    }
    this.Module.HEAPF32.set(data, this.dataPtr / Float32Array.BYTES_PER_ELEMENT);
    this.Module._kalman_update(this.ptr, this.dataPtr, data.length, qTemp, rTemp);
    /*
    const update = new Float32Array(
      this.Module.HEAPF32.buffer,
      this.dataPtr,
      data.length
    );
    */
    // perform inplace update
    const update = new Float32Array(
      this.Module.HEAPF32.subarray(
        this._dataPtr / Float32Array.BYTES_PER_ELEMENT,
        this._dataPtr / Float32Array.BYTES_PER_ELEMENT + data.length
      )
    );
    // TODO this should be an immutable operation?
    data.set(update);
  }

  reset() {
    this.Module._kalman_reset(this.ptr);
  }

  delete() {
    this.Module._kalman_delete(this.ptr);
  }
}
