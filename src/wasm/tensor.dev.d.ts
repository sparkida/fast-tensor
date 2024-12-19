import { WasmModule } from '../types/WasmModule';

declare module 'tensor.dev.js' {
  const wasmModule: () => Promise<WasmModule>;
  export default wasmModule;
}
