import type { WasmModule } from './types/WasmModule.d.ts';
import { WasmInterfaceLoader } from '@loader';
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const isNode = typeof process !== 'undefined' && process.versions?.node !== null;

export default abstract class Interface {
  /** @hidden */
  static Module: WasmModule;
  protected deleted = false;
  protected ptr = 0;
  protected _dataPtr = 0;
  private static WasmInterfacePromise: Promise<WasmModule> = WasmInterfaceLoader();

  static async setWasmPath(path: string) {
    if (!isNode) {
      const loader = await Interface.WasmInterfacePromise;
      Interface.WasmInterfacePromise = loader.default({
        locateFile: () => path
      });
      // immediately load
      void Interface.ready();
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


