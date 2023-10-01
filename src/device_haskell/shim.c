#include <stdint.h>

uint32_t _num() __attribute__((
  __import_module__("deps"),
  __import_name__("num")
));

uint32_t num() {
  return _num();
}
