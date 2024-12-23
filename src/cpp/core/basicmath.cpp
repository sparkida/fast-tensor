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
Tensor Tensor::floor() const { return math_op(std::floor); }

// Mean
Tensor Tensor::mean(int axis, bool keepdims) const {/*{{{*/
  std::vector<Real> means;
  const auto& vec = data_ref();
  size_t nrows = rows;
  size_t ncols = cols;

  if (axis == -1) {
    // Mean of all elements
    means.resize(1, 0.0f);
    Real sum = 0.0f;
    size_t size = vec.size();
    for (auto& elem : vec) {
      sum += elem;
    }
    means[0] = sum / size;
    nrows = 1;
    ncols = 1;
  } else if (axis == 0) {
    // Mean column-wise (reduce rows)
    means.resize(cols, 0.0f);
    for (size_t j = 0; j < cols; ++j) {
      Real sum = 0.0f;
      for (size_t i = 0; i < rows; ++i) {
        sum += vec[i * cols + j];
      }
      means[j] = sum / rows;
    }
    nrows = 1;
  } else if (axis == 1) {
    // Mean row-wise (reduce columns)
    means.resize(rows, 0.0f);
    for (size_t i = 0; i < rows; ++i) {
      Real sum = 0.0f;
      for (size_t j = 0; j < cols; ++j) {
        sum += vec[i * cols + j];
      }
      means[i] = sum / cols;
    }
    ncols = 1;
  }

  return Tensor(nrows, ncols, !keepdims && axis < 0, std::move(means));
}/*}}}*/

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
  Tensor* tensor_floor(Tensor* tensor) { return new Tensor(tensor->floor()); }

  Tensor* tensor_mean(
      Tensor* tensor,
      int axis = -1,
      bool keepdims = false,
      int* shape_wire = nullptr
      ) {

    Tensor* new_tensor = new Tensor(tensor->mean(axis, keepdims));
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
  }

  Tensor* tensor_square(Tensor* tensor) { return new Tensor(tensor->square()); }
}
