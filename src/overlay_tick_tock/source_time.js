/**
 * This callback tells Unix time in seconds
 * @callback nowCallback
 * @returns {number} - Seconds since Unix epoch
 */
function now() {
  return Date.now() / 1000;
}

/**
 * Interface of the Time source
 * @typedef {Object} sourceTimeAPI
 * @property {nowCallback} now
 */

/**
 * Source that tells time
 * @returns {sourceTimeAPI}
 */
export async function SourceTime() {
  return { now }
}
