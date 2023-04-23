/**
 * Instantiates a wasm module with imported source API and exported methods
 * @param {string} url - Path to wasm module
 * @param {Object} args - Callbacks from source
 * @returns {Object} - Interface of the device
 */
export function Device(url, args) {
  return WebAssembly.instantiateStreaming(
    fetch(url),
    { "env": args }
  ).then((wasm) => wasm.instance.exports);
}

/**
 * Renders overlay in a loop
 */
export async function refresh(source, device, overlay, callbacks) {
  // initialize source with IO
  const sourceAPI = await source();

  // initialize device with a source
  const deviceAPI = await device(callbacks(sourceAPI))

  // set page html to the overlay of device
  document.getElementById("view").innerHTML = overlay(callbacks(sourceAPI, deviceAPI))

  // frame rate 60fps
  setTimeout(() => refresh(source, device, overlay, callbacks), 33.33);
}
