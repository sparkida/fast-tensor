#include "../Tensor.h"

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

extern "C" {
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

  Tensor* tensor_square(Tensor* tensor) {
    return new Tensor(tensor->square());
  }
}
