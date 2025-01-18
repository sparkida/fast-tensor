#include "../Tensor.h"

// All bitwise AND op
Tensor Tensor::all(int axis, bool keepdims) const {/*{{{*/
  std::vector<Real> result;
  const auto& vec = data_ref();
  size_t nrows = rows;
  size_t ncols = cols;
  float zero = 0.0f;

  if (axis == -1) {
    bool found = false;
    for (auto& elem : vec) {
      if (elem == zero) {
        found = true;
        break;
      }
    }
    result.push_back(found ? zero : 1.0f);
    nrows = 1;
    ncols = 1;
  } else if (axis == 0) {
    result.resize(cols, 1.0f);
    for (size_t j = 0; j < cols; ++j) {
      for (size_t i = 0; i < rows; ++i) {
        if (vec[i * cols + j] == zero) {
          result[j] = zero;
          break;
        }
      }
    }
    nrows = 1;
  } else if (axis == 1) {
    result.resize(rows, 1.0f);
    for (size_t i = 0; i < rows; ++i) {
      for (size_t j = 0; j < cols; ++j) {
        if (vec[i * cols + j] == zero) {
          result[i] = zero;
          break;
        }
      }
    }
    ncols = 1;
  }

  return Tensor(nrows, ncols, !keepdims && axis < 0, std::move(result));
}/*}}}*/

// Any bitwise OR op
Tensor Tensor::any(int axis, bool keepdims) const {/*{{{*/
  std::vector<Real> result;
  const auto& vec = data_ref();
  size_t nrows = rows;
  size_t ncols = cols;
  float zero = 0.0f;

  if (axis == -1) {
    bool found = false;
    for (auto& elem : vec) {
      if (elem != zero) {
        found = true;
        break;
      }
    }
    result.push_back(found ? 1.0f : zero);
    nrows = 1;
    ncols = 1;
  } else if (axis == 0) {
    result.resize(cols, 0.0f);
    for (size_t j = 0; j < cols; ++j) {
      for (size_t i = 0; i < rows; ++i) {
        if (vec[i * cols + j] != zero) {
          result[j] = 1.0f;
          break;
        }
      }
    }
    nrows = 1;
  } else if (axis == 1) {
    result.resize(rows, 0.0f);
    for (size_t i = 0; i < rows; ++i) {
      for (size_t j = 0; j < cols; ++j) {
        if (vec[i * cols + j] != zero) {
          result[i] = 1.0f;
          break;
        }
      }
    }
    ncols = 1;
  }

  return Tensor(nrows, ncols, !keepdims && axis < 0, std::move(result));
}/*}}}*/

// ArgMax
Tensor Tensor::arg_max(int axis) const {/*{{{*/
  std::vector<Real> result;
  const auto& vec = data_ref();
  size_t nrows = rows;
  size_t ncols = cols;
  if (is1d) {
    int max_index = std::distance(vec.begin(), std::max_element(vec.begin(), vec.end()));
    result.push_back(static_cast<Real>(max_index));
    ncols = 1;
    nrows = 1;
  } else if (axis == 0) {
    result.resize(cols, 0.0f);
    for (size_t j = 0; j < cols; ++j) {
      for (size_t i = 1; i < rows; ++i) {
        if (vec[i * cols + j] > vec[(i - 1) * cols + j]) {
          result[j] = static_cast<Real>(i);
        }
      }
    }
    nrows = 1;
  } else if (axis == 1) {
    result.resize(rows, 0.0f);
    for (size_t i = 0; i < rows; ++i) {
      for (size_t j = 1; j < cols; ++j) {
        if (vec[i * cols + j] > vec[i * cols + (j - 1)]) {
          result[i] = static_cast<Real>(j);
        }
      }
    }
    ncols = 1;
  }
  return Tensor(nrows, ncols, is1d, std::move(result));
}/*}}}*/

// ArgMin
Tensor Tensor::arg_min(int axis) const {/*{{{*/
  std::vector<Real> result;
  const auto& vec = data_ref();
  size_t nrows = rows;
  size_t ncols = cols;
  if (is1d) {
    int min_index = std::distance(vec.begin(), std::min_element(vec.begin(), vec.end()));
    result.push_back(static_cast<Real>(min_index));
    ncols = 1;
    nrows = 1;
  } else if (axis == 0) {
    result.resize(cols, 0.0f);
    for (size_t j = 0; j < cols; ++j) {
      for (size_t i = 1; i < rows; ++i) {
        if (vec[i * cols + j] < vec[(i - 1) * cols + j]) {
          result[j] = static_cast<Real>(i);
        }
      }
    }
    nrows = 1;
  } else if (axis == 1) {
    result.resize(rows, 0.0f);
    for (size_t i = 0; i < rows; ++i) {
      for (size_t j = 1; j < cols; ++j) {
        if (vec[i * cols + j] < vec[i * cols + (j - 1)]) {
          result[i] = static_cast<Real>(j);
        }
      }
    }
    ncols = 1;
  }
  return Tensor(nrows, ncols, is1d, std::move(result));
}/*}}}*/

// Max
Tensor Tensor::max(int axis, bool keepdims) const {/*{{{*/
  std::vector<Real> result;
  const auto& vec = data_ref();
  size_t nrows = rows;
  size_t ncols = cols;
  const Real lowest = std::numeric_limits<Real>::lowest();

  if (axis == -1) {
    // Mean of all elements
    Real max_val = lowest;
    for (auto& elem : vec) {
      if (elem > max_val) {
        max_val = elem;
      }
    }
    result.push_back(max_val);
    nrows = 1;
    ncols = 1;
  } else if (axis == 0) {
    // Mean column-wise (reduce rows)
    result.resize(cols, 0.0f);
    for (size_t j = 0; j < cols; ++j) {
      Real max_val = lowest;
      for (size_t i = 0; i < rows; ++i) {
        Real val = vec[i * cols + j];
        if (val > max_val) {
          std::swap(max_val, val);
        }
      }
      std::swap(result[j], max_val);
    }
    nrows = 1;
  } else if (axis == 1) {
    // Mean row-wise (reduce columns)
    result.resize(rows, 0.0f);
    for (size_t i = 0; i < rows; ++i) {
      Real max_val = lowest;
      for (size_t j = 0; j < cols; ++j) {
        Real val = vec[i * cols + j];
        if (val > max_val) {
          std::swap(max_val, val);
        }
      }
      std::swap(result[i], max_val);
    }
    ncols = 1;
  }

  return Tensor(nrows, ncols, !keepdims && axis < 0, std::move(result));
}/*}}}*/

// Mean
Tensor Tensor::mean(int axis, bool keepdims) const {/*{{{*/
  std::vector<Real> means;
  const auto& vec = data_ref();
  size_t nrows = rows;
  size_t ncols = cols;

  if (axis == -1) {
    // Mean of all elements
    Real sum = 0.0f;
    size_t size = vec.size();
    for (auto& elem : vec) {
      sum += elem;
    }
    means.push_back(sum / size);
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

// Min
Tensor Tensor::min(int axis, bool keepdims) const {/*{{{*/
  std::vector<Real> result;
  const auto& vec = data_ref();
  size_t nrows = rows;
  size_t ncols = cols;

  if (axis == -1) {
    // Mean of all elements
    Real min_val = Tensor::INF;
    for (auto& elem : vec) {
      if (elem < min_val) {
        min_val = elem;
      }
    }
    result.push_back(min_val);
    nrows = 1;
    ncols = 1;
  } else if (axis == 0) {
    // Mean column-wise (reduce rows)
    result.resize(cols, 0.0f);
    for (size_t j = 0; j < cols; ++j) {
      Real min_val = Tensor::INF;
      for (size_t i = 0; i < rows; ++i) {
        Real val = vec[i * cols + j];
        if (val < min_val) {
          std::swap(min_val, val);
        }
      }
      std::swap(result[j], min_val);
    }
    nrows = 1;
  } else if (axis == 1) {
    // Mean row-wise (reduce columns)
    result.resize(rows, 0.0f);
    for (size_t i = 0; i < rows; ++i) {
      Real min_val = Tensor::INF;
      for (size_t j = 0; j < cols; ++j) {
        Real val = vec[i * cols + j];
        if (val < min_val) {
          std::swap(min_val, val);
        }
      }
      std::swap(result[i], min_val);
    }
    ncols = 1;
  }

  return Tensor(nrows, ncols, !keepdims && axis < 0, std::move(result));
}/*}}}*/

// Sum
Tensor Tensor::sum(int axis, bool keepdims) const {/*{{{*/
  std::vector<Real> result;
  const auto& vec = data_ref();
  size_t nrows = rows;
  size_t ncols = cols;

  if (axis == -1) {
    Real sum = 0.0f;
    for (auto& elem : vec) {
      sum += elem;
    }
    result.push_back(sum);
    nrows = 1;
    ncols = 1;
  } else if (axis == 0) {
    // Mean column-wise (reduce rows)
    result.resize(cols, 0.0f);
    for (size_t j = 0; j < cols; ++j) {
      Real sum = 0.0f;
      for (size_t i = 0; i < rows; ++i) {
        sum += vec[i * cols + j];
      }
      std::swap(result[j], sum);
    }
    nrows = 1;
  } else if (axis == 1) {
    // Mean row-wise (reduce columns)
    result.resize(rows, 0.0f);
    for (size_t i = 0; i < rows; ++i) {
      Real sum = 0.0f;
      for (size_t j = 0; j < cols; ++j) {
        sum += vec[i * cols + j];
      }
      std::swap(result[i], sum);
    }
    ncols = 1;
  }

  return Tensor(nrows, ncols, !keepdims && axis < 0, std::move(result));
}/*}}}*/

// Product
Tensor Tensor::prod(int axis, bool keepdims) const {/*{{{*/
  std::vector<Real> result;
  const auto& vec = data_ref();
  size_t nrows = rows;
  size_t ncols = cols;

  if (axis == -1) {
    Real prod = 1.0f;
    for (auto& elem : vec) {
      prod *= elem;
    }
    result.push_back(prod);
    nrows = 1;
    ncols = 1;
  } else if (axis == 0) {
    // Mean column-wise (reduce rows)
    result.resize(cols, 0.0f);
    for (size_t j = 0; j < cols; ++j) {
      Real prod = 1.0f;
      for (size_t i = 0; i < rows; ++i) {
        prod *= vec[i * cols + j];
      }
      std::swap(result[j], prod);
    }
    nrows = 1;
  } else if (axis == 1) {
    // Mean row-wise (reduce columns)
    result.resize(rows, 0.0f);
    for (size_t i = 0; i < rows; ++i) {
      Real prod = 1.0f;
      for (size_t j = 0; j < cols; ++j) {
        prod *= vec[i * cols + j];
      }
      std::swap(result[i], prod);
    }
    ncols = 1;
  }

  return Tensor(nrows, ncols, !keepdims && axis < 0, std::move(result));
}/*}}}*/

extern "C" {
  Tensor* tensor_all(
      Tensor* tensor,
      int axis = -1,
      bool keepdims = false,
      int* shape_wire = nullptr
      ) {

    Tensor* new_tensor = new Tensor(tensor->all(axis, keepdims));
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
  }

  Tensor* tensor_any(
      Tensor* tensor,
      int axis = -1,
      bool keepdims = false,
      int* shape_wire = nullptr
      ) {

    Tensor* new_tensor = new Tensor(tensor->any(axis, keepdims));
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
  }

  Tensor* tensor_arg_max(Tensor* tensor, int axis = 0, int* shape_wire = nullptr) {
    Tensor* new_tensor = new Tensor(tensor->arg_max(axis));
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
  }

  Tensor* tensor_arg_min(Tensor* tensor, int axis = 0, int* shape_wire = nullptr) {
    Tensor* new_tensor = new Tensor(tensor->arg_min(axis));
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
  }

  Tensor* tensor_max(
      Tensor* tensor,
      int axis = -1,
      bool keepdims = false,
      int* shape_wire = nullptr
      ) {

    Tensor* new_tensor = new Tensor(tensor->max(axis, keepdims));
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
  }

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

  Tensor* tensor_min(
      Tensor* tensor,
      int axis = -1,
      bool keepdims = false,
      int* shape_wire = nullptr
      ) {

    Tensor* new_tensor = new Tensor(tensor->min(axis, keepdims));
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
  }

  Tensor* tensor_prod(
      Tensor* tensor,
      int axis = -1,
      bool keepdims = false,
      int* shape_wire = nullptr
      ) {

    Tensor* new_tensor = new Tensor(tensor->prod(axis, keepdims));
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
  }

  Tensor* tensor_sum(
      Tensor* tensor,
      int axis = -1,
      bool keepdims = false,
      int* shape_wire = nullptr
      ) {

    Tensor* new_tensor = new Tensor(tensor->sum(axis, keepdims));
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
  }
}
