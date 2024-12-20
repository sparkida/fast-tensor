#include "../Tensor.h"

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

extern "C" {
  Tensor* tensor_pad(Tensor* tensor, int* shape_wire, Real constant,
      size_t rpad_before, size_t rpad_after, size_t cpad_before, size_t cpad_after) {
    Tensor* new_tensor = new Tensor(tensor->pad(constant, rpad_before, rpad_after, cpad_before, cpad_after));
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
  }

  Tensor* tensor_flatten(Tensor* tensor) {
    return new Tensor(tensor->rows, tensor->cols, true, tensor->data);
  }

  Tensor* tensor_reshape(
      Tensor* tensor,
      int new_rows,
      int new_cols,
      int* shape_wire = nullptr
      ) {
    Tensor* new_tensor = new Tensor(tensor->reshape(new_rows, new_cols));
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
  }
}
