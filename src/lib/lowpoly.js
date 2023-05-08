import * as msgpack from 'https://cdn.jsdelivr.net/npm/@msgpack/msgpack@3.0.0-beta2/+esm'
import { AsyncWasmInstance } from "./asyncify.js";

async function lowerBuffer(memory, __new, buffer) {
  const pointer = await __new(buffer.byteLength, 1);

  new Uint8Array(memory.buffer).set(new Uint8Array(buffer), pointer);

  return pointer
}

function liftBuffer(memory, pointer) {
  return memory.buffer.slice(
    pointer,
    pointer + new Uint32Array(memory.buffer)[pointer - 4 >>> 2]
  )
}

function msgpackifyExportFn(memory, __new, exportFn) {
  //TODO: add support for multiple arguments
  //TODO: add extension codec for BigInt
  return async(arg, ...args) => {
    const argBuffer = msgpack.encode(arg, { useBigInt64: true });

    const argPointer = await lowerBuffer(memory, __new, argBuffer);

    // const resPointer = await exportFn(argPointer, ...args);
    const resPointer = await exportFn(argPointer);

    const resBuffer = liftBuffer(memory, resPointer);

    const res = msgpack.decode(resBuffer);

    return res
  }
}

function msgpackifyExports(exports) {
  const exportsNew = Object.create(null);

  // map exports
  for (const exportName in exports) {
    let value = exports[exportName];

    if (typeof value === "function"
        && !exportName.startsWith("asyncify_")
        && !exportName.startsWith("__")
        && exportName !== "abort") {
      value = msgpackifyExportFn(exports.memory, exports.__new, value);
    }

    Object.defineProperty(exportsNew, exportName, {
      enumerable: true,
      value,
    });
  }

  return exportsNew
}

export class LowpolyInstance {
  constructor() {}

  static async createInstance(config) {
    const instance = await AsyncWasmInstance.createInstance(config);

    instance._wrappedExports = msgpackifyExports(instance._wrappedExports)

    return instance;
  }
}
