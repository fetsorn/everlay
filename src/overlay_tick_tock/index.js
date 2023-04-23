import { SourceTime } from "./source_time.js";
import { DeviceEvenOdd } from "./device_even_odd.js";
import { OverlayTickTock } from "./overlay_tick_tock.js";
import { refresh } from "./lib.js";

function callbacks(sourceAPI, deviceAPI) {
  return {
    num: sourceAPI.now,
    trueFalse: deviceAPI?.isEven
  }
}

refresh(SourceTime, DeviceEvenOdd, OverlayTickTock, callbacks)
