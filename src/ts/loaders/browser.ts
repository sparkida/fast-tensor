import type { WasmModule } from '../types/WasmModule.d.ts';

export async function WasmInterfaceLoader(): Promise<WasmModule> {
  const wasmModule = await import('../../wasm/tensor.esm.js') as WasmModule;
  return wasmModule;
}
