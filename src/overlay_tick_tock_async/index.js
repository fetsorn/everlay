import { SourceTime } from "./source_time.js";
import { DeviceEvenOdd } from "./device_even_odd.js";
import { OverlayTickTock } from "./overlay_tick_tock.js";
import { Chart } from "./lib.js";

const steps = [
  SourceTime,
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
export async function render() {
  // Connect sources, devices and overlays
  const chart = await Chart(steps);

  const overlay = await OverlayTickTock(chart);

  // set page html to the overlay of device
  document.getElementById("view").innerHTML = overlay;
}

// frame rate 60fps
setInterval(render, 33.33);
