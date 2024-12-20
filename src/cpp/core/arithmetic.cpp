#include "../Tensor.h"

// Add by a scalar, column-wise array, or tensor
Tensor Tensor::add(const Real* input, size_t input_size) const {/*{{{*/
  Tensor result = deepcopy();
  auto& vec = (*result.data);

  if (input_size == 1) {
    Real scalar = input[0];
    for (auto& elem : vec) {
      elem += scalar;
    }
  } else if (input_size == cols) {
    for (size_t i = 0; i < rows; ++i) {
      for (size_t j = 0; j < cols; ++j) {
        vec[i * cols + j] += input[j];
      }
    }
  } else if (input_size == cols * rows) {
    for (size_t i = 0; i < rows; ++i) {
      for (size_t j = 0; j < cols; ++j) {
        vec[i * cols + j] += input[i * cols + j];
      }
    }
  } else {
    throw std::invalid_argument("Input must be a scalar or a column-wise array with size equal to the number of columns");
  }
  return result;
}/*}}}*/

// Subtract by a scalar, column-wise array, or tensor
Tensor Tensor::sub(const Real* input, size_t input_size) const {/*{{{*/
  Tensor result = deepcopy();
  auto& vec = (*result.data);

  if (input_size == 1) {
    Real scalar = input[0];
    for (auto& elem : vec) {
      elem -= scalar;
    }
  } else if (input_size == cols) {
    for (size_t i = 0; i < rows; ++i) {
      for (size_t j = 0; j < cols; ++j) {
        vec[i * cols + j] -= input[j];
      }
    }
  } else if (input_size == cols * rows) {
    for (size_t i = 0; i < rows; ++i) {
      for (size_t j = 0; j < cols; ++j) {
        vec[i * cols + j] -= input[i * cols + j];
      }
    }
  } else {
    throw std::invalid_argument("Input must be a scalar or a column-wise array with size equal to the number of columns");
  }
  return result;
}/*}}}*/

// Multiply by a scalar, column-wise array, or tensor
Tensor Tensor::mul(const Real* input, size_t input_size) const {/*{{{*/
  Tensor result = deepcopy();
  auto& vec = (*result.data);

  if (input_size == 1) {
    Real scalar = input[0];
    for (auto& elem : vec) {
      elem *= scalar;
    }
  } else if (input_size == cols) {
    for (size_t i = 0; i < rows; ++i) {
      for (size_t j = 0; j < cols; ++j) {
        vec[i * cols + j] *= input[j];
      }
    }
  } else if (input_size == cols * rows) {
    for (size_t i = 0; i < rows; ++i) {
      for (size_t j = 0; j < cols; ++j) {
        vec[i * cols + j] *= input[i * cols + j];
      }
    }
  } else {
    throw std::invalid_argument("Input must be a scalar or a column-wise array with size equal to the number of columns");
  }
  return result;
}/*}}}*/

// Divide by a scalar, column-wise array, or tensor
Tensor Tensor::div(bool no_nan, const Real* input, size_t input_size) const {/*{{{*/
  Tensor result = deepcopy();
  auto& vec = (*result.data);

  if (input_size == 1) {
    Real scalar = input[0];
    for (auto& elem : vec) {
      elem /= scalar;
    }
  } else if (input_size == cols) {
    for (size_t i = 0; i < rows; ++i) {
      for (size_t j = 0; j < cols; ++j) {
        vec[i * cols + j] /= input[j];
      }
    }
  } else if (input_size == cols * rows) {
    for (size_t i = 0; i < rows; ++i) {
      for (size_t j = 0; j < cols; ++j) {
        vec[i * cols + j] /= input[i * cols + j];
      }
    }
  } else {
    throw std::invalid_argument("Input must be a scalar or a column-wise array with size equal to the number of columns");
  }
  if (no_nan) {
    for (auto& elem : vec) {
      if (elem == Tensor::INF || std::isnan(elem)) {
        elem = 0;
      }
    }
  }
  return result;
}/*}}}*/

// Return the maximum between two tensors
Tensor Tensor::maximum(const Tensor& other) const {/*{{{*/
  if (cols != other.cols || rows != other.rows) {
    throw std::invalid_argument("Tensor shapes do not match");
  }

  // Allocate space for the result
  Tensor result(rows, cols, is1d);
  const auto& cur_data = data_ref();
  const auto& other_data = (*other.data);
  auto& vec = (*result.data);

  // Perform tensor multiplication
  for (size_t i = 0; i < rows * cols; ++i) {
    vec[i] = std::max(cur_data[i], other_data[i]);
  }
  return result;
}/*}}}*/

// Return the maximum of current data compared with scalar
Tensor Tensor::maximum(const Real scalar) const {/*{{{*/
  // Allocate space for the result
  Tensor result(rows, cols, is1d);
  const auto& cur_data = data_ref();
  auto& vec = (*result.data);

  // Perform tensor multiplication
  for (size_t i = 0; i < rows * cols; ++i) {
    vec[i] = std::max(cur_data[i], scalar);
  }
  return result;
}/*}}}*/

// Return the minimum between two tensors
Tensor Tensor::minimum(const Tensor& other) const {/*{{{*/
  if (cols != other.cols || rows != other.rows) {
    throw std::invalid_argument("Tensor shapes do not match");
  }

  // Allocate space for the result
  Tensor result(rows, cols, is1d);
  const auto& cur_data = data_ref();
  const auto& other_data = (*other.data);
  auto& vec = (*result.data);

  // Perform tensor multiplication
  for (size_t i = 0; i < rows * cols; ++i) {
    vec[i] = std::min(cur_data[i], other_data[i]);
  }
  return result;
}/*}}}*/

// Return the minimum of current data compared with scalar
Tensor Tensor::minimum(const Real scalar) const {/*{{{*/
  // Allocate space for the result
  Tensor result(rows, cols, is1d);
  const auto& cur_data = data_ref();
  auto& vec = (*result.data);

  // Perform tensor multiplication
  for (size_t i = 0; i < rows * cols; ++i) {
    vec[i] = std::min(cur_data[i], scalar);
  }
  return result;
}/*}}}*/

// Return the mod between two tensors
Tensor Tensor::mod(const Tensor& other) const {/*{{{*/
  if (cols != other.cols || rows != other.rows) {
    throw std::invalid_argument("Tensor shapes do not match");
  }

  // Allocate space for the result
  Tensor result(rows, cols, is1d);
  const auto& cur_data = data_ref();
  const auto& other_data = (*other.data);
  auto& vec = (*result.data);

  // Perform tensor multiplication
  for (size_t i = 0; i < rows * cols; ++i) {
    vec[i] = std::fmod(cur_data[i], other_data[i]);
  }
  return result;
}/*}}}*/

// Return the mod of current data compared with scalar
Tensor Tensor::mod(const Real scalar) const {/*{{{*/
  // Allocate space for the result
  Tensor result(rows, cols, is1d);
  const auto& cur_data = data_ref();
  auto& vec = (*result.data);

  // Perform tensor multiplication
  for (size_t i = 0; i < rows * cols; ++i) {
    vec[i] = std::fmod(cur_data[i], scalar);
  }
  return result;
}/*}}}*/

// Return the pow between two tensors
Tensor Tensor::pow(const Tensor& other) const {/*{{{*/
  if (cols != other.cols || rows != other.rows) {
    throw std::invalid_argument("Tensor shapes do not match");
  }

  // Allocate space for the result
  Tensor result(rows, cols, is1d);
  const auto& cur_data = data_ref();
  const auto& other_data = (*other.data);
  auto& vec = (*result.data);

  // Perform tensor multiplication
  for (size_t i = 0; i < rows * cols; ++i) {
    vec[i] = std::pow(cur_data[i], other_data[i]);
  }
  return result;
}/*}}}*/

// Return the pow of current data compared with scalar
Tensor Tensor::pow(const Real scalar) const {/*{{{*/
  // Allocate space for the result
  Tensor result(rows, cols, is1d);
  const auto& cur_data = data_ref();
  auto& vec = (*result.data);

  // Perform tensor multiplication
  for (size_t i = 0; i < rows * cols; ++i) {
    vec[i] = std::pow(cur_data[i], scalar);
  }
  return result;
}/*}}}*/

// Return the squared_diff between two tensors
Tensor Tensor::squared_diff(const Tensor& other) const {/*{{{*/
  if (cols != other.cols || rows != other.rows) {
    throw std::invalid_argument("Tensor shapes do not match");
  }

  // Allocate space for the result
  Tensor result(rows, cols, is1d);
  const auto& cur_data = data_ref();
  const auto& other_data = (*other.data);
  auto& vec = (*result.data);

  // Perform tensor multiplication
  for (size_t i = 0; i < rows * cols; ++i) {
    Real diff = cur_data[i] - other_data[i];
    vec[i] = diff * diff;
  }
  return result;
}/*}}}*/

// Return the squared_diff of current data compared with scalar
Tensor Tensor::squared_diff(const Real scalar) const {/*{{{*/
  // Allocate space for the result
  Tensor result(rows, cols, is1d);
  const auto& cur_data = data_ref();
  auto& vec = (*result.data);

  // Perform tensor multiplication
  for (size_t i = 0; i < rows * cols; ++i) {
    Real diff = cur_data[i] - scalar;
    vec[i] = diff * diff;
  }
  return result;
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

  Tensor* tensor_maximum(Tensor* tensor, const Tensor& other) {
    return new Tensor(tensor->maximum(other));
  }

  Tensor* tensor_maximum_scalar(Tensor* tensor, const Real scalar) {
    return new Tensor(tensor->maximum(scalar));
  }

  Tensor* tensor_minimum(Tensor* tensor, const Tensor& other) {
    return new Tensor(tensor->minimum(other));
  }

  Tensor* tensor_minimum_scalar(Tensor* tensor, const Real scalar) {
    return new Tensor(tensor->minimum(scalar));
  }

  Tensor* tensor_mod(Tensor* tensor, const Tensor& other) {
    return new Tensor(tensor->mod(other));
  }

  Tensor* tensor_mod_scalar(Tensor* tensor, const Real scalar) {
    return new Tensor(tensor->mod(scalar));
  }

  Tensor* tensor_pow(Tensor* tensor, const Tensor& other) {
    return new Tensor(tensor->pow(other));
  }

  Tensor* tensor_pow_scalar(Tensor* tensor, const Real scalar) {
    return new Tensor(tensor->pow(scalar));
  }

  Tensor* tensor_squared_diff(Tensor* tensor, const Tensor& other) {
    return new Tensor(tensor->squared_diff(other));
  }

  Tensor* tensor_squared_diff_scalar(Tensor* tensor, const Real scalar) {
    return new Tensor(tensor->squared_diff(scalar));
  }
}
