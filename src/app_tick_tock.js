import { SourceTime } from "./source_time/index.js";
import { OverlayTickTock } from "./overlay_tick_tock/index.js";
import { Device, Chart } from "./lib/index.js";

const steps = [
  SourceTime,
  ["now", "num"],
  Device("./device_even_odd/build/release.wasm"),
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

  const overlay = OverlayTickTock(chart)

  // set page html to the overlay of device
  document.getElementById("view").innerHTML = overlay;
}

// frame rate 60fps
setInterval(render, 33.33);
