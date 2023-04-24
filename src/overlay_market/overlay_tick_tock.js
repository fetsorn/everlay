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
export async function OverlayTickTock(args) {
  return await args.trueFalse() ? "tock" : "tick";
}
