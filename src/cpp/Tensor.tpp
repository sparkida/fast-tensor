#pragma once

template <typename Func>
Tensor Tensor::apply_math_op(Func func) const {
  Tensor result = deepcopy();
  auto& vec = (*result.data);
  for (auto& elem : vec) {
    elem = func(elem);
  }
  return result;
}

// Generic broadcastable operation
template <typename Func>
Tensor Tensor::broadcast_op(const Real* input, size_t input_size, Func func) const {
  Tensor result = deepcopy();
  auto& vec = (*result.data);

  if (input_size == 1) {
    Real scalar = input[0];
    for (auto& elem : vec) {
      elem = func(elem, scalar);
    }
  } else if (input_size == cols) {
    for (size_t i = 0; i < rows; ++i) {
      for (size_t j = 0; j < cols; ++j) {
        size_t index = i * cols + j;
        vec[index] = func(vec[index], input[j]);
      }
    }
  } else if (input_size == cols * rows) {
    for (size_t i = 0; i < rows; ++i) {
      for (size_t j = 0; j < cols; ++j) {
        size_t index = i * cols + j;
        vec[index] = func(vec[index], input[i * cols + j]);
      }
    }
  } else {
    throw std::invalid_argument("Input must be a scalar or a column-wise array with size equal to the number of columns");
  }
  return result;
}
