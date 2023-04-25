import * as asyncify from "bindings/asyncify";
import { BigInt } from "as-bigint/assembly"
import { num, log } from "./deps"

export function isEvenI32(): bool {
  return num() % 2 === 0;
}

export function isEven(): bool {
  return BigInt.from(num()).mod(2).isZero();
}

export function abort(
  msg: string | null,
  file: string | null,
  line: u32,
  column: u32
): void {}
