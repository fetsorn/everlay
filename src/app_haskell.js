import { SourceTime } from "./source_time/index.js";
import { OverlayTickTock } from "./overlay_tick_tock_async/index.js";
import { DeviceWASI, Chart } from "./lib/index.js";

const steps = [
  SourceTime,
  ["now", "num"],
  DeviceWASI("./device_haskell/isEven.wasm"),
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

// 1 frame per second to avoid rate limit in source
setInterval(render, 1000);
