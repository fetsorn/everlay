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
 * A match betweeen an old and a new chart endpoint
 * @typedef {string} callback - A callback from the chart
 * @typedef {string} endpoint - A new API endpoint
 * @typedef {[callback, endpoint]} Connection
 */

/**
 * A constructor for a source or a device
 * @function SourceOrDevice
 * @returns {Object} - API of source or device
 */

/**
 * An action to add endpoints to the chart
 * @typedef {SourceOrDevice|Connection} Step
 */

/**
 * Adds one connection to a chart
 * @param {Object} chart - Chart of connections
 * @param {Step} step - An action to add endpoints to the chart
 * @returns {Object} - New chart of connections
 */
async function updateChart(chart, step) {
  if (typeof step === 'function') {
    const sourceOrDevice = await step(chart);

    return { ...sourceOrDevice, ...chart };
  } else if (step instanceof Array) {
    const [ callback, key ] = step;

    return {
      ...chart,
      [key]: chart[callback]
    }
  }
}

/**
 * Draws a chart of connections
 * between sources, devices and overlays
 * @param {Step[]} steps
 * @returns {Object} - Chart of connections
 */
async function makeChart(steps) {
  return steps.reduce(
    async (chartPromise, step) => {
      return updateChart(await chartPromise, step);
    },
    Promise.resolve({})
  );
}

/**
 * Renders overlay in a loop
 * @param {Step[]} steps
 * @param {Function} overlay
 * @returns {void}
 */
export async function refresh(steps, overlay) {
  // Connect sources, devices and overlays
  const chart = await makeChart(steps);

  // set page html to the overlay of device
  document.getElementById("view").innerHTML = overlay(chart);

  // frame rate 60fps
  setTimeout(() => refresh(steps, overlay), 33.33);
}
