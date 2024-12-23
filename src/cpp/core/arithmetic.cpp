#include "../Tensor.h"

// Add by a scalar, column-wise array, or tensor
Tensor Tensor::add(const Real* input, size_t input_size) const {/*{{{*/
  return Tensor::broadcast_op(input, input_size,
      [](Real a, Real b) { return a + b; });
}/*}}}*/

// Subtract by a scalar, column-wise array, or tensor
Tensor Tensor::sub(const Real* input, size_t input_size) const {/*{{{*/
  return Tensor::broadcast_op(input, input_size,
      [](Real a, Real b) { return a - b; });
}/*}}}*/

// Multiply by a scalar, column-wise array, or tensor
Tensor Tensor::mul(const Real* input, size_t input_size) const {/*{{{*/
  return Tensor::broadcast_op(input, input_size,
      [](Real a, Real b) { return a * b; });
}/*}}}*/

// Divide by a scalar, column-wise array, or tensor
Tensor Tensor::div(bool no_nan, const Real* input, size_t input_size) const {/*{{{*/
  Tensor result = Tensor::broadcast_op(input, input_size,
      [](Real a, Real b) { return a / b; });
  if (no_nan) {
    auto& vec = (*result.data);
    for (auto& elem : vec) {
      if (elem == Tensor::INF || std::isnan(elem)) {
        elem = 0;
      }
    }
  }
  return result;
}/*}}}*/

// Return the maximum of current data compared with scalar
Tensor Tensor::maximum(const Real* input, size_t input_size) const {/*{{{*/
  return Tensor::broadcast_op(input, input_size,
      [](Real a, Real b) { return std::max(a,b); });
}/*}}}*/

// Return the minimum of current data compared with scalar
Tensor Tensor::minimum(const Real* input, size_t input_size) const {/*{{{*/
  return Tensor::broadcast_op(input, input_size,
      [](Real a, Real b) { return std::min(a,b); });
}/*}}}*/

// Return the mod of current data compared with scalar
Tensor Tensor::mod(const Real* input, size_t input_size) const {/*{{{*/
  return Tensor::broadcast_op(input, input_size,
      [](Real a, Real b) { return std::fmod(a,b); });
}/*}}}*/

// Return the pow of current data compared with scalar
Tensor Tensor::pow(const Real* input, size_t input_size) const {/*{{{*/
  return Tensor::broadcast_op(input, input_size,
      [](Real a, Real b) { return std::pow(a,b); });
}/*}}}*/

// Return the squared_diff of current data compared with scalar
Tensor Tensor::squared_diff(const Real* input, size_t input_size) const {/*{{{*/
  return Tensor::broadcast_op(input, input_size,
      [](Real a, Real b) {
      Real diff = a - b;
      return diff * diff;
      });
}/*}}}*/

extern "C" {
  Tensor* tensor_add(Tensor* tensor, const Real* input, size_t size) {
    return new Tensor(tensor->add(input, size));
  }

  Tensor* tensor_sub(Tensor* tensor, const Real* input, size_t size) {
    return new Tensor(tensor->sub(input, size));
  }

  Tensor* tensor_mul(Tensor* tensor, const Real* input, size_t size) {
    return new Tensor(tensor->mul(input, size));
  }

  Tensor* tensor_div(Tensor* tensor, bool no_nan, const Real* input, size_t size) {
    return new Tensor(tensor->div(no_nan, input, size));
  }

  Tensor* tensor_maximum(Tensor* tensor, const Real* input, size_t input_size) {
    return new Tensor(tensor->maximum(input, input_size));
  }

  Tensor* tensor_minimum(Tensor* tensor, const Real* input, size_t input_size) {
    return new Tensor(tensor->minimum(input, input_size));
  }

  Tensor* tensor_mod(Tensor* tensor, const Real* input, size_t input_size) {
    return new Tensor(tensor->mod(input, input_size));
  }

  Tensor* tensor_pow(Tensor* tensor, const Real* input, size_t input_size) {
    return new Tensor(tensor->pow(input, input_size));
  }

  Tensor* tensor_squared_diff(Tensor* tensor, const Real* input, size_t input_size) {
    return new Tensor(tensor->squared_diff(input, input_size));
  }
}
