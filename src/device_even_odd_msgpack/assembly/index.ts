import * as asyncify from "bindings/asyncify";
import { BigInt } from "@fetsorn/as-bigint/assembly";
import { ReadDecoder, WriteSizer, WriteEncoder } from "@fetsorn/as-msgpack/assembly";
import { num, log } from "./deps";

export function isEven(): ArrayBuffer {
  const argBuffer: ArrayBuffer = num();

  // const decoder = new ReadDecoder(argBuffer);

  // const arg: string = decoder.readString();

  // const res = BigInt.fromString(arg).mod(2).isZero();

  const res = true;

  const sizer = new WriteSizer();

  sizer.writeBool(res);

  const resBuffer = new ArrayBuffer(sizer.length)

  const encoder = new WriteEncoder(resBuffer, sizer);

  encoder.writeBool(res);

  return resBuffer
}

export function abort(
  msg: string | null,
  file: string | null,
  line: u32,
  column: u32
): void {}
