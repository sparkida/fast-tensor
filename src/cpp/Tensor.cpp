#include "Tensor.h"

Tensor::Tensor(size_t rows, size_t cols, bool is1d) 
  : rows(rows), cols(cols), is1d(is1d),
  data(std::make_shared<std::vector<float>>(rows * cols, 0.0f)) { }

// Allow data pointer to be shared without copying
// this is benneficial for when we just need a reference and know
// that operations will be changing the underlying data structure
Tensor::Tensor(size_t rows, size_t cols, bool is1d, std::shared_ptr<std::vector<Real>> shared_data_ptr)
  : rows(rows), cols(cols), is1d(is1d),
  data(std::move(shared_data_ptr)) {}

// Transfer a temporary data vec to the new tensor class, avoiding a copy
Tensor::Tensor(size_t rows, size_t cols, bool is1d, std::vector<Real> tmp_data)
  : rows(rows), cols(cols), is1d(is1d),
  data(std::make_shared<std::vector<Real>>(std::move(tmp_data))) {}

// create a deep copy of the tensor, dereferncing the shared data pointer
Tensor::Tensor(const Tensor& other)
  : rows(other.rows), cols(other.cols), is1d(other.is1d),
  data(std::make_shared<std::vector<float>>(*other.data)) {}

  /*
// Allow data to be copied directly on initialization, useful
// for when we know the data will be manipulated directly (on the same shape structure)
// otherwise we'd always have to check uniqueness to gaurantee immutability
Tensor::Tensor(size_t rows, size_t cols, bool is1d, std::shared_ptr<std::vector<Real>>& data_copy)
  : rows(rows), cols(cols), is1d(is1d),
  data(std::make_shared<std::vector<Real>>(*data_copy)) {}

  */

Tensor::~Tensor() {}

// helper function to create a copy
Tensor Tensor::deepcopy() const {
  return *this;
}

// Provide read-only access
const std::vector<Real>& Tensor::data_ref() const {
  return *data;
}

// Provide read-write access
std::vector<Real>& Tensor::data_ref() {
  return *data;
}

/*
// Get the value at (row, col)
Real Tensor::get(size_t row, size_t col) const {
  return (*data)[row * cols + col];
}

// Set the value at (row, col)
void Tensor::set(size_t row, size_t col, Real value) {
  //ensure_unique();
  (*data)[row * cols + col] = value;
}
*/

// TODO convert to minmax
// TODO add option for axis
// TODO min
// TODO max
// TODO minimum
// TODO maximum
// TODO slice
// TODO gather
Bounds Tensor::get_bounds() const {/*{{{*/
  const auto& vec = data_ref();
  Bounds bounds = { vec[0], vec[0], vec[0], vec[0] };
  for (size_t i = 0; i < rows; ++i) {
    for (size_t j = 0; j < cols; ++j) {
      Real current = vec[i * cols + j];
      if (j == 0) { // X dimension
        bounds.xmin = std::min(bounds.xmin, current);
        bounds.xmax = std::max(bounds.xmax, current);
      } else if (j == 1) { // Y dimension
        bounds.ymin = std::min(bounds.ymin, current);
        bounds.ymax = std::max(bounds.ymax, current);
      }
    }
  }
  return bounds;
}/*}}}*/

Shape Tensor::get_shape() const {/*{{{*/
  Shape shape = { rows, cols, is1d };
  return shape;
}/*}}}*/

Tensor Tensor::identity() const {/*{{{*/
  std::vector<Real> eye(rows * cols, 0.0f);
  for (size_t j = 0; j < cols; ++j) {
    eye[j * cols + j] = 1.0f;
  }
  return Tensor(rows, cols, is1d, std::move(eye));
}/*}}}*/

// Pad data, row/col, begin to end
Tensor Tensor::pad(Real constant, size_t rpad_before, /*{{{*/
    size_t rpad_after, size_t cpad_before, size_t cpad_after) const {
  const auto& vec = data_ref();
  size_t nrows = rows + rpad_before + rpad_after;
  size_t ncols = cols + cpad_before + cpad_after;
  size_t new_size = ncols * nrows;
  
  std::vector<Real> padded(new_size, constant);

  for (size_t i = rpad_before; i < nrows - rpad_after; ++i) {
    size_t rindex = i - rpad_before;
    for (size_t j = cpad_before; j < ncols - cpad_after; ++j) {
      size_t cindex = rindex * cols + (j - cpad_before);
      padded[i * ncols + j] = vec[cindex];
    }
  }
  return Tensor(nrows, ncols, is1d, std::move(padded));
}/*}}}*/

// Create a diagonal of the 1d data padded with zeros
Tensor Tensor::diag() const {/*{{{*/
  const auto& vec = data_ref();
  size_t nrows = vec.size();
  std::vector<Real> diag(cols * nrows, 0.0f);

  for (size_t i = 0; i < nrows; ++i) {
    diag[i * cols + i] = vec[i];
  }
  return Tensor(nrows, cols, false, std::move(diag));
}/*}}}*/

Tensor Tensor::reverse(const int axis) const {/*{{{*/
  Tensor result = deepcopy();
  auto& vec = (*result.data);
  std::vector<float>::iterator begin = vec.begin();

  if (axis == -1) {
    std::reverse(begin, vec.end());
  } else if (axis == 0) {
    for (size_t r = 0; r < rows / 2; ++r) {
      // Swap the row at index `r` with the row at index `rows - 1 - r`
      int start_row1 = r * cols;
      int start_row2 = (rows - 1 - r) * cols;
      std::swap_ranges(begin + start_row1, begin + start_row1 + cols,
          begin + start_row2);
    }
  } else if (axis == 1) {
    for (size_t i = 0; i < rows; ++i) {
      std::reverse(begin + i * cols, begin + i * cols + cols);
    }
  }
  return result;
}/*}}}*/

// Transpose
Tensor Tensor::transpose() const {/*{{{*/
  // swap dimensions
  Tensor result(cols, rows, is1d);
  const auto& cur_data = data_ref();
  auto& vec = (*result.data);

  // Perform transpose
  for (size_t i = 0; i < rows; ++i) {
    for (size_t j = 0; j < cols; ++j) {
      vec[j * rows + i] = cur_data[i * cols + j];
    }
  }
  return result;
}/*}}}*/

// Flatten
Tensor Tensor::flatten() const {/*{{{*/
  // return a shallow copy of data via shared pointer
  return Tensor(rows, cols, true, data); 
}/*}}}*/

// Reshape
Tensor Tensor::reshape(int new_rows, int new_cols) const {/*{{{*/
  size_t total_elements = (*data).size();
  int inferred_rows = new_rows;
  int inferred_cols = new_cols == -2 ? -1 : new_cols; // Use -1 as the default for inference
  bool became_1d = false;

  // Adjust logic to avoid breaking when one dimension is -1 and the other is std::nullopt
  if (inferred_rows == -1 && new_cols == -1) {
    throw std::invalid_argument("At most one dimension can be -1");
  }

  if (inferred_rows == -1) {
    // Infer rows from cols
    if (new_cols == -2) {
      // flatten to 1D
      became_1d = true;
      inferred_rows = 1;
      inferred_cols = static_cast<int>(total_elements);
    } else if (inferred_cols < 1 || total_elements % inferred_cols != 0) {
      throw std::invalid_argument("New dimensions are incompatible with the total number of elements");
    } else {
      inferred_rows = total_elements / inferred_cols;
    }
  } else if (inferred_cols == -1) {
    // Infer cols from rows
    if (inferred_rows < 1 || total_elements % inferred_rows != 0) {
      throw std::invalid_argument("New dimensions are incompatible with the total number of elements");
    }
    inferred_cols = total_elements / inferred_rows;
  }

  // Validate dimensions
  if (inferred_rows <= 0 || inferred_cols <= 0 
      || inferred_rows * inferred_cols != static_cast<int>(total_elements)) {
    throw std::invalid_argument("New dimensions do not match the total number of elements");
  }

  // return a shallow copy of data via shared pointer
  return Tensor(
      static_cast<size_t>(inferred_rows),
      static_cast<size_t>(inferred_cols),
      became_1d, data);
}/*}}}*/

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
Tensor Tensor::div(const Real* input, size_t input_size) const {/*{{{*/
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
  return result;
}/*}}}*/

// Square
Tensor Tensor::square() const {/*{{{*/
  Tensor result = deepcopy();
  auto& vec = (*result.data);
  size_t items = vec.size();
  for (size_t i = 0; i < items; ++i) {
    vec[i] *= vec[i];
  }
  return result;
}/*}}}*/

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
    for (size_t i = 0; i < size; ++i) {
      sum += vec[i];
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

// Norm
Tensor Tensor::norm(NORM_ORD ord, int axis, bool keepdims) const {/*{{{*/
  std::vector<Real> norms;
  const auto& vec = data_ref();
  const Real lowest = std::numeric_limits<Real>::lowest();
  size_t nrows = rows;
  size_t ncols = cols;

  if (axis == -1) {
    // Compute norm for all elements (flattened tensor)
    Real result = 0.0f;
    switch(ord) {
      case NORM_ORD::L1:
        for (Real val : vec) {
          result += std::abs(val);
        }
        break;
      case NORM_ORD::L2:
        for (Real val : vec) {
          result += val * val;
        }
        result = std::sqrt(result);
        break;
      case NORM_ORD::MAX:
        result = lowest;
        for (Real val : vec) {
          result = std::max(result, std::abs(val));
        }
        break;
      default:
        throw std::invalid_argument("Unsupported norm type");
        break;
    }
    norms.push_back(result);
    nrows = 1;
    ncols = 1;
  } else if (axis == 0) {
    // Compute column-wise norm
    norms.resize(cols, 0.0f);
    for (size_t j = 0; j < cols; ++j) {
      switch(ord) {
        case NORM_ORD::L1:
          for (size_t i = 0; i < rows; ++i) {
            norms[j] += std::abs(vec[i * cols + j]);
          }
          break;
        case NORM_ORD::L2:
          for (size_t i = 0; i < rows; ++i) {
            Real val = vec[i * cols + j];
            norms[j] += val * val;
          }
          norms[j] = std::sqrt(norms[j]);
          break;
        case NORM_ORD::MAX:
          norms[j] = lowest;
          for (size_t i = 0; i < rows; ++i) {
            norms[j] = std::max(norms[j], std::abs(vec[i * cols + j]));
          }
          break;
      }
    }
    nrows = 1;
  } else if (axis == 1) {
    // Compute row-wise norm
    norms.resize(rows, 0.0f);
    for (size_t i = 0; i < rows; ++i) {
      switch(ord) {
        case NORM_ORD::L1:
          for (size_t j = 0; j < cols; ++j) {
            norms[i] += std::abs(vec[i * cols + j]);
          }
          break;
        case NORM_ORD::L2:
          for (size_t j = 0; j < cols; ++j) {
            Real val = vec[i * cols + j];
            norms[i] += val * val;
          }
          norms[i] = std::sqrt(norms[i]);
          break;
        case NORM_ORD::MAX:
          norms[i] = lowest;
          for (size_t j = 0; j < cols; ++j) {
            norms[i] = std::max(norms[i], std::abs(vec[i * cols + j]));
          }
          break;
      }
    }
    ncols = 1;
  } else {
    throw std::invalid_argument("Axis must be -1 (flat), 0 (column-wise) or 1 (row-wise)");
  }

  return Tensor(nrows, ncols, !keepdims && axis < 0, std::move(norms));
}/*}}}*/

// Tensor Multiplication
Tensor Tensor::matmul(const Tensor& other) const {/*{{{*/
  if (cols != other.rows) {
    throw std::invalid_argument("Tensor dimensions do not match for multiplication");
  }
  // Validate shapes for multiplication
  if (cols != other.rows) {
    throw std::invalid_argument("Tensor shapes are incompatible for multiplication");
  }

  // Determine the shape of the result
  size_t result_rows = rows;
  size_t result_cols = other.cols;

  // Allocate space for the result
  Tensor result(result_rows, other.cols, is1d);
  const auto& cur_data = data_ref();
  const auto& other_data = (*other.data);
  auto& vec = (*result.data);

  // Perform tensor multiplication
  for (size_t i = 0; i < result_rows; ++i) {
    for (size_t j = 0; j < result_cols; ++j) {
      for (size_t k = 0; k < cols; ++k) { // `cols` of `this` is equal to `other.rows`
        vec[i * result_cols + j] += cur_data[i * cols + k] * other_data[k * other.cols + j];
      }
    }
  }
  return result;
}/*}}}*/

