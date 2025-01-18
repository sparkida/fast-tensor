#include "../Tensor.h"

Tensor Tensor::abs() const { return math_op(std::abs); }
Tensor Tensor::acos() const { return math_op(std::acos); }
Tensor Tensor::acosh() const { return math_op(std::acosh); }
Tensor Tensor::asin() const { return math_op(std::asin); }
Tensor Tensor::asinh() const { return math_op(std::asinh); }
Tensor Tensor::atan() const { return math_op(std::atan); }
Tensor Tensor::atan2(const Real* input, size_t input_size) const {
  return Tensor::broadcast_op(input, input_size,
      [](Real a, Real b) { return std::atan2(a,b); });
}
Tensor Tensor::atanh() const { return math_op(std::atanh); }
Tensor Tensor::ceil() const { return math_op(std::ceil); }
Tensor Tensor::clip(const Real lower, const Real upper) const {
  Tensor result = deepcopy();
  auto& vec = (*result.data);
  for (auto& elem : vec) {
    if (elem > upper) {
      elem = upper;
    } else if (elem < lower) {
      elem = lower;
    }
  }
  return result;
}
Tensor Tensor::cos() const { return math_op(std::cos); }
Tensor Tensor::cosh() const { return math_op(std::cosh); }
Tensor Tensor::floor() const { return math_op(std::floor); }

// Square
Tensor Tensor::square() const {/*{{{*/
  Tensor result = deepcopy();
  auto& vec = (*result.data);
  for (auto& elem : vec) {
    elem *= elem;
  }
  return result;
}/*}}}*/

extern "C" {

  Tensor* tensor_abs(Tensor* tensor) { return new Tensor(tensor->abs()); }
  Tensor* tensor_acos(Tensor* tensor) { return new Tensor(tensor->acos()); }
  Tensor* tensor_acosh(Tensor* tensor) { return new Tensor(tensor->acosh()); }
  Tensor* tensor_asin(Tensor* tensor) { return new Tensor(tensor->asin()); }
  Tensor* tensor_asinh(Tensor* tensor) { return new Tensor(tensor->asinh()); }
  Tensor* tensor_atan(Tensor* tensor) { return new Tensor(tensor->atan()); }
  Tensor* tensor_atan2(Tensor* tensor, const Real* input, size_t input_size) {
    return new Tensor(tensor->atan2(input, input_size));
  }
  Tensor* tensor_atanh(Tensor* tensor) { return new Tensor(tensor->atanh()); }
  Tensor* tensor_ceil(Tensor* tensor) { return new Tensor(tensor->ceil()); }
  Tensor* tensor_clip(Tensor* tensor, const Real lower, const Real upper) {
    return new Tensor(tensor->clip(lower, upper));
  }
  Tensor* tensor_cos(Tensor* tensor) { return new Tensor(tensor->cos()); }
  Tensor* tensor_cosh(Tensor* tensor) { return new Tensor(tensor->cosh()); }
  Tensor* tensor_floor(Tensor* tensor) { return new Tensor(tensor->floor()); }

  Tensor* tensor_square(Tensor* tensor) { return new Tensor(tensor->square()); }
}
