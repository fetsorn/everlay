import { SourceMarket } from "./source_market_msgpack/index.js";
import { OverlayTickTock } from "./overlay_tick_tock_async/index.js";
import { DeviceMsgpack, Chart } from "./lib/index.js";

const steps = [
  SourceMarket,
  ["now", "num"],
  DeviceMsgpack("./device_even_odd_msgpack/build/release.wasm"),
  ["isEven", "trueFalse"],
];

/**
 * Renders overlay in a loop
 * @param {Step[]} steps
 * @param {Function} overlay
 * @returns {void}
 */
async function render() {
  // Connect sources, devices and overlays
  const chart = await Chart(steps);

  const overlay = await OverlayTickTock(chart);

  // set page html to the overlay of device
  document.getElementById("view").innerHTML = overlay;
}

// 1 frame per 10 seconds to avoid rate limit in source
render()
setInterval(render, 10000);