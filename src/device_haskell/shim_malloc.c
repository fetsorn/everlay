#include <stdint.h>
#include <stdlib.h>
#include <string.h>

int8_t * _malloc(size_t size) {
  int8_t *ptr;

  size_t overhead = sizeof(size_t);

  // int8_t for byte array
  ptr = (int8_t*) malloc(overhead + size);

  // first byte is for array size
  *ptr = size;

  // may be visited before being fully initialized, so must fill
  memset(ptr + overhead, 0, size);

  return ptr;
}

