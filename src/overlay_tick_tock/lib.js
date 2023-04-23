/**
 * Instantiates a wasm module with imported source API and exported methods
 * @param {string} url - Path to wasm module
 * @param {Object} args - Callbacks from source
 * @returns {Object} - Interface of the device
 */
export async function Device(url, args) {
  const wasm = await WebAssembly.instantiateStreaming(
    fetch(url),
    { "env": args }
  )

  return wasm.instance.exports;
}

/**
 * Renders overlay in a loop
 */
export async function refresh(sourcesOrDevices, connections, overlay) {
  // do magic with source and device
  const callbacks = await sourcesOrDevices.reduce(
    async (chartPromise, SourceOrDevice) => {
      const chartOld = await chartPromise;

      const sourceOrDevice = await SourceOrDevice(chartOld);

      const chartNew = { ...sourceOrDevice, ...chartOld };

      const chartConnected = connections.reduce(
        (chart, [callback, key]) => ({
          ...chart,
          [key]: chart[callback]
        }),
        chartNew
      );

      return chartConnected
    },
    Promise.resolve({})
  );

  // set page html to the overlay of device
  document.getElementById("view").innerHTML = overlay(callbacks)

  // frame rate 60fps
  setTimeout(() => refresh(sourcesOrDevices, connections, overlay), 33.33);
}
