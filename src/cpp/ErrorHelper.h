#pragma once
#ifdef __has_include
#  if __has_include(<emscripten.h>)
#    include <emscripten.h>
#  endif
#endif

extern "C" {
  void report_error(const char* msg);
}
