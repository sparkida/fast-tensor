import type { WasmModule } from './types/WasmModule.d.ts';
import { WasmInterfaceLoader } from '@loader';
const isWeb = typeof window === 'object';

export default abstract class Interface {
  /** @hidden */
  static Module: WasmModule;
  protected deleted = false;
  protected ptr = 0;
  protected _dataPtr = 0;
  private static WasmInterfacePromise: Promise<WasmModule> = WasmInterfaceLoader();

  static async setWasmPath(path: string) {
    if (isWeb) {
      const loader = await Interface.WasmInterfacePromise;
      Interface.WasmInterfacePromise = loader.default({
        locateFile: () => path
      });
    }
  }

  static async ready(): Promise<void> {
    const loadedModule: WasmModule = await Interface.WasmInterfacePromise;
    Interface.Module = loadedModule;
  }

  /** @hidden */
  get Module(): WasmModule {
    return Interface.Module;
  }

  /** @hidden */
  get dataPtr(): number {
    return this._dataPtr;
  }

  /** @hidden */
  _free(ptr: number): void {
    Interface.Module._free(ptr);
  }
}


