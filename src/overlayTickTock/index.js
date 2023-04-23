/**
 * This callback tells Unix time
 * @callback nowCallback
 * @returns {number} - Unix time
 */

/**
 * Interface of the Time source
 * @typedef {Object} sourceTimeAPI
 * @property {nowCallback} now - Unix time
 */

/**
 * Source that tells time
 * @returns {sourceTimeAPI} - Source methods
 */
function SourceTime() {
  return { now: Date.now }
}

/**
 * This callback returns a number
 * @callback numberCallback
 * @returns {number}
 */

/**
 * Callbacks from source
 * @typedef {Object} deviceEvenOddArgs
 * @property {numberCallback} num
 */

/**
 * This function checks if the source number is even
 * @function isEven
 * @returns {boolean}
 */

/**
 * Interface of the EvenOdd device
 * @typedef {Object} deviceEvenOddAPI
 * @property {isEven} isEven
 */

/**
 * Device that tells if the source number is even or odd
 * @param {deviceEvenOddArgs}
 * @returns {deviceEvenOddAPI}
 */
function DeviceEvenOdd(api) {
  return WebAssembly.instantiateStreaming(
    fetch("/deviceEvenOdd.wasm"),
    { "env": api }
  ).then((wasm) => ({ isEven: wasm.instance.exports.isEven }));
}

/**
 * This callback returns true or false
 * @callback isTrue
 * @returns {boolean}
 */

/**
 * Callbacks from device
 * @typedef {Object} overlayTickTockArgs
 * @property {isTrue} isTrue
 */

/**
 * Overlay that is ticking
 * @param {overlayTickTockArgs} args
 * @returns {string} - text "tick" or "tock"
 */
function overlayTickTock(args) {
  return args.trueFalse() ? "tick" : "tock"
}

/**
 * Renders overlay in a loop
 */
function refresh() {
  // initialize device with source
  DeviceEvenOdd({
    num: SourceTime().now
  }).then(({ isEven }) => {
    // set page html to the overlay of device
    document.getElementById("view").innerHTML = overlayTickTock({
      trueFalse: isEven
    })
    // frame rate 60fps
    setTimeout(refresh, 33.33);
  })
}

refresh()
