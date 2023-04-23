import { SourceTime } from "./source_time.js";
import { DeviceEvenOdd } from "./device_even_odd.js";
import { OverlayTickTock } from "./overlay_tick_tock.js";
import { refresh } from "./lib.js";

function connectChart(chart, connection) {
  const inputs = { ...connection, ...chart };

  return {
    ...inputs,
    num: inputs.now,
    trueFalse: inputs.isEven
  }
}

refresh([SourceTime, DeviceEvenOdd], OverlayTickTock, connectChart)
