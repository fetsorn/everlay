import { SourceMarket } from "./source_market.js";
import { DeviceEvenOdd } from "./device_even_odd.js";
import { OverlayTickTock } from "./overlay_tick_tock.js";
import { Chart } from "./lib.js";

const steps = [
  SourceMarket,
  ["now", "num"],
  DeviceEvenOdd,
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
