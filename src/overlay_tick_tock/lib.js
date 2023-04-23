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
export async function refresh(connections, overlay, connectChart) {
  // do magic with source and device
  const callbacks = await connections.reduce(
    async (acc, connection) => {
      const chart = await acc;

      return connectChart(chart, await connection(chart))
    },
    Promise.resolve({})
  );

  // set page html to the overlay of device
  document.getElementById("view").innerHTML = overlay(callbacks)

  // frame rate 60fps
  setTimeout(() => refresh(connections, overlay, connectChart), 33.33);
}
