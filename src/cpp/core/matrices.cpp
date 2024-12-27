#include "../Tensor.h"

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
        report_error("Unsupported norm type");
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
    report_error("Axis must be -1 (flat), 0 (column-wise) or 1 (row-wise)");
  }

  return Tensor(nrows, ncols, !keepdims && axis < 0, std::move(norms));
}/*}}}*/

// Tensor Multiplication
Tensor Tensor::matmul(const Tensor& other) const {/*{{{*/
  // Validate shapes for multiplication
  if (cols != other.rows) {
    report_error("Tensor shapes are incompatible for multiplication");
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

extern "C" {
  Tensor* tensor_transpose(Tensor* tensor) {
    return new Tensor(tensor->transpose());
  }

  Tensor* tensor_norm(
      Tensor* tensor,
      int ord = 0,
      int axis = -1,
      bool keepdims = false,
      int* shape_wire = nullptr
      ) {
    Tensor* new_tensor = new Tensor(tensor->norm(static_cast<NORM_ORD>(ord), axis, keepdims));
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
  }

  Tensor* tensor_matmul(Tensor* tensor, const Tensor& other, int* shape_wire) {
    Tensor* new_tensor = new Tensor(tensor->matmul(other));
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
  }
}
