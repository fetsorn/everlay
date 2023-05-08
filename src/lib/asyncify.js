/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-empty-function */

function isPromise(test) {
  return !!test && typeof test.then === "function";
}

export function proxyGet(
  obj,
  transform) {
  return new Proxy(obj, {
    get: (obj, name) => {
      return transform(obj[name], name);
    },
  });
}

export function indexOfArray(source, search) {
  let run = true;
  let start = 0;

  while (run) {
    const idx = source.indexOf(search[0], start);

    // not found
    if (idx < start) {
      run = false;
      continue;
    }

    // Make sure the rest of the subarray contains the search pattern
    const subBuff = source.subarray(idx, idx + search.length);

    let retry = false;
    let i = 1;
    for (; i < search.length && !retry; ++i) {
      if (subBuff[i] !== search[i]) {
        retry = true;
      }
    }

    if (retry) {
      start = idx + i;
      continue;
    } else {
      return idx;
    }
  }

  return -1;
}

const AsyncifyState = Object.freeze({
    None: 0,
    Unwinding: 1,
    Rewinding: 2
});

export class AsyncWasmInstance {
  static requiredExports = [
    "asyncify_start_unwind",
    "asyncify_stop_unwind",
    "asyncify_start_rewind",
    "asyncify_stop_rewind",
    "asyncify_get_state",
  ];

  static _dataAddr = 16;
  static _dataStart = AsyncWasmInstance._dataAddr + 8;
  static _dataEnd = 1024;

  _instance;
  _wrappedImports;
  _wrappedExports;
  _importFnResult;

  constructor() {}

  // createMemory(config: { module }) {
  static createMemory(config) {
    // extract the initial memory page size, as it will
    // throw an error if the imported page size differs:
    // https://chromium.googlesource.com/v8/v8/+/644556e6ed0e6e4fac2dfabb441439820ec59813/src/wasm/module-instantiate.cc#924
    const envMemoryImportSignature = Uint8Array.from([
      // env ; import module name
      0x65,
      0x6e,
      0x76,
      // string length
      0x06,
      // memory ; import field name
      0x6d,
      0x65,
      0x6d,
      0x6f,
      0x72,
      0x79,
      // import kind
      0x02,
      // limits ; https://github.com/sunfishcode/wasm-reference-manual/blob/master/WebAssembly.md#resizable-limits
      // limits ; flags
      // 0x??,
      // limits ; initial
      // 0x__,
    ]);

    const sigIdx = indexOfArray(config.module, envMemoryImportSignature);

    if (sigIdx < 0) {
      throw Error(
        `Unable to find Wasm memory import section. ` +
          `Modules must import memory from the "env" module's ` +
          `"memory" field like so:\n` +
          `(import "env" "memory" (memory (;0;) #))`
      );
    }

    // Extract the initial memory page-range size
    const memoryInitialLimits =
      config.module[sigIdx + envMemoryImportSignature.length + 1];

    if (memoryInitialLimits === undefined) {
      throw Error(
        "No initial memory number found, this should never happen..."
      );
    }

    return new WebAssembly.Memory({ initial: memoryInitialLimits });
  }

  static async createInstance(config) {
    const instance = new AsyncWasmInstance();
    // Wrap imports
    instance._wrappedImports = instance._wrapImports(config.imports);

    // Create Wasm module instance
    instance._instance = (
      await WebAssembly.instantiate(config.module, instance._wrappedImports)
    ).instance;

    // Ensure all required exports exist on Wasm module
    const exportKeys = Object.keys(instance._instance.exports);
    const missingExports = [
      ...AsyncWasmInstance.requiredExports,
      ...(config.requiredExports || []),
    ].filter((name) => !exportKeys.includes(name));

    if (missingExports.length) {
      throw new Error(
        `Required Wasm exports were not found: ${missingExports.join(", ")}`
      );
    }

    const exports = instance._instance.exports;

    // Wrap exports
    instance._wrappedExports = instance._wrapExports(exports);

    // Initialize Asyncify stack pointers
    const memory = (exports.memory ||
      (config.imports.env && config.imports.env.memory));
    // const memory = ((config.imports.env && config.imports.env.memory) || exports.memory);

    new Int32Array(memory.buffer, AsyncWasmInstance._dataAddr).set([
      AsyncWasmInstance._dataStart,
      AsyncWasmInstance._dataEnd,
    ]);
    return instance;
  }

  exports() {
    return this._wrappedExports;
  }

  _getAsyncifyState() {
    return this._wrappedExports.asyncify_get_state();
  }

  _assertNoneState() {
    const state = this._getAsyncifyState();
    if (state !== AsyncifyState.None) {
      throw new Error(`Invalid asyncify state ${state}, expected 0.`);
    }
  }

  _wrapImports(imports) {
    return proxyGet(
      imports,
      (moduleImports, name) => {
        if (moduleImports === undefined) {
          throw Error(
            `Unsupported wasm import namespace requested: "${name}"; ` +
              `Supported wasm import namespaces: ${Object.keys(imports)
                .map((x) => `"${x}"`)
                .join(", ")}`
          );
        }
        return this._wrapModuleImports(moduleImports);
      }
    );
  }

  _wrapModuleImports(imports) {
    return proxyGet(
      imports,
      (importValue, name) => {
        if (importValue === undefined) {
          throw Error(
            `Unsupported wasm import requested: "${name}"; ` +
              `Supported wasm imports: ${Object.keys(imports)
                .map((x) => `"${x}"`)
                .join(", ")}`
          );
        }
        if (typeof importValue === "function") {
          return this._wrapImportFn(importValue);
        }
        return importValue;
      }
    );
  }

  _wrapImportFn(importFn) {
    return (...args) => {
      if (this._getAsyncifyState() === AsyncifyState.Rewinding) {
        this._wrappedExports.asyncify_stop_rewind();
        return this._importFnResult;
      }
      this._assertNoneState();
      const value = importFn(...args);
      if (!isPromise(value)) {
        return value;
      }
      this._wrappedExports.asyncify_start_unwind(AsyncWasmInstance._dataAddr);
      this._importFnResult = value;
    };
  }

  _wrapExports(exports) {
    const newExports = Object.create(null);

    for (const exportName in exports) {
      let value = exports[exportName];
      if (typeof value === "function"
          && !exportName.startsWith("asyncify_")
          && !exportName.startsWith("__")
          && exportName !== "abort") {
        value = this._wrapExportFn(value);
      }
      Object.defineProperty(newExports, exportName, {
        enumerable: true,
        value,
      });
    }

    return newExports;
  }

  _wrapExportFn(exportFn) {
    return async (...args) => {
      this._assertNoneState();

      let result = exportFn(...args);

      while (this._getAsyncifyState() === AsyncifyState.Unwinding) {
        this._wrappedExports.asyncify_stop_unwind();
        this._importFnResult = await this._importFnResult;
        this._assertNoneState();
        this._wrappedExports.asyncify_start_rewind(AsyncWasmInstance._dataAddr);
        result = exportFn();
      }

      this._assertNoneState();

      return result;
    };
  }
}
