import { Device } from "./lib.js";

/**
 * This callback returns a number
 * @callback numberCallback
 * @returns {number}
 */

/**
 * Callbacks from source
 * @typedef {Object} deviceEvenOddCallbacks
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
 * @param {deviceEvenOddCallbacks}
 * @returns {deviceEvenOddAPI}
 */
export function DeviceEvenOdd(callbacks) {
  return Device("/device-even-odd.wasm", callbacks)
}
