import { WasmModule } from '../types/WasmModule';

declare module 'tensor.esm.js' {
  const wasmModule: () => Promise<WasmModule>;
  export default wasmModule;
}
