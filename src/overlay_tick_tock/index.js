import { SourceTime } from "./source_time.js";
import { DeviceEvenOdd } from "./device_even_odd.js";
import { OverlayTickTock } from "./overlay_tick_tock.js";
import { refresh } from "./lib.js";

refresh(
  [
    SourceTime,
    DeviceEvenOdd
  ],
  [
    ["now", "num"],
    ["isEven", "trueFalse"]
  ],
  OverlayTickTock
)
