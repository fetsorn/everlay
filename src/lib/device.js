import { AsyncWasmInstance } from "./asyncify.js";
import { LowpolyInstance } from "./lowpoly.js";

/**
 * Instantiates a wasm module with imported source API and exported methods
 * @param {string} url - Path to wasm module
 * @param {Object} args - Callbacks from source
 * @returns {Object} - Interface of the device
 */
export function Device(url) {
  return async (args) => {
    const memory = new WebAssembly.Memory({ initial: 1 });

    const wasm = await WebAssembly.instantiateStreaming(
      fetch(url),
      { deps: args, env: { memory } }
    )

    return wasm.instance.exports;
  }
}

/**
 * Instantiates a wasm module with imported source API and exported methods
 * @param {string} url - Path to wasm module
 * @param {Object} args - Callbacks from source
 * @returns {Object} - Interface of the device
 */
export function DeviceAsync(url) {
  return async (args) => {
    const module = await (await fetch(url)).arrayBuffer();

    const memory = new WebAssembly.Memory({ initial: 1 });

    const instance = await AsyncWasmInstance.createInstance({
      module,
      imports: {
        deps: args,
        env: {
          memory
        }
      }
    });

    return instance._wrappedExports;
  }
}

/**
 * Instantiates a wasm module with imported source API and exported methods
 * @param {string} url - Path to wasm module
 * @param {Object} args - Callbacks from source
 * @returns {Object} - Interface of the device
 */
export function DeviceMsgpack(url) {
  return async (args) => {
    const module = await (await fetch(url)).arrayBuffer();
    const memory = new WebAssembly.Memory({ initial: 1 });

    const instance = await LowpolyInstance.createInstance({
      module,
      imports: {
        deps: args,
        env: {
          memory
        }
      }
    });

    return instance._wrappedExports;
  }
}
