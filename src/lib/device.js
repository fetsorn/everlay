import { WASI, File, OpenFile, PreopenDirectory } from 'https://cdn.jsdelivr.net/npm/@bjorn3/browser_wasi_shim@0.2.15/+esm'
import { AsyncWasmInstance } from "./asyncify.js";
import { MsgpackWasmInstance } from "./msgpackify.js";

/**
 * Instantiates a wasm module with imported source API and exported methods
 * @param {string} url - Path to wasm module
 * @param {Object} args - Callbacks from source
 * @returns {Object} - Interface of the device
 */
export function Device(url) {
  return async (args) => {
    const module = fetch(url)

    const memory = new WebAssembly.Memory({ initial: 1 });

    const wasm = await WebAssembly.instantiateStreaming(
      module,
      {
        deps: args,
        env: {
          memory
        }
      }
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
export function DeviceWASI(url) {
  return async (args) => {
    const module = fetch(url)

    const memory = new WebAssembly.Memory({ initial: 1 });

    let env = ["FOO=bar"];
    let fds = [
      new OpenFile(new File([])), // stdin
      new OpenFile(new File([])), // stdout
      new OpenFile(new File([])), // stderr
      new PreopenDirectory(".", {
        "example.c": new File(new TextEncoder("utf-8").encode(`#include "a"`)),
        "hello.rs": new File(new TextEncoder("utf-8").encode(`fn main() { println!("Hello World!"); }`)),
      }),
    ];
    let wasi = new WASI(["bin", "arg1", "arg2"], env, fds);

    const wasm = await WebAssembly.instantiateStreaming(
      module,
      {
        deps: args,
        env: {
          memory
        },
        wasi_snapshot_preview1: wasi.wasiImport,
      }
    )

    if (wasm.instance.exports._initialize !== undefined) {
      await wasi.initialize(wasm.instance);
    }

    if (wasm.instance.exports.hs_init !== undefined) {
      wasm.instance.exports.hs_init(0, 0);
    }

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

    // const memory = new WebAssembly.Memory({ initial: 1 });
    // TODO not tested
    const memory = AsyncWasmInstance.createMemory({ module });

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

    const instance = await MsgpackWasmInstance.createInstance({
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
