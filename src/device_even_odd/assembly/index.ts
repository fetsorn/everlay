import { num } from "./env"

export function isEven(): bool {
  return num() % 2 == 0;
}
