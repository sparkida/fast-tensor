import { WasmModule } from '../types/WasmModule';

declare module 'tensor.node.esm.js' {
  const wasmModule: () => Promise<WasmModule>;
  export default wasmModule;
}
