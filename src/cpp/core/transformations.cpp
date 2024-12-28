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
  // we pass -2 as null alias, which means we'll infer the column size
  int inferred_cols = new_cols == -2 ? -1 : new_cols;
  bool became_1d = false;

  // handle 
  if (inferred_rows == -1 && (inferred_cols < 1 && new_cols != -2)) {
    std::string message = "Shapes can not be < 0. Found " \
                           + std::to_string(inferred_cols) \
                           + " at dim 1";
    report_error(message.c_str());
  } else if ((inferred_rows == 0 && inferred_cols == -1) || (inferred_rows == -1 && inferred_cols == 0)) {
    std::string message = "Cannot infer the missing size in [" \
                           + std::to_string(inferred_rows) + "," \
                           + std::to_string(inferred_cols) + "]";
    report_error(message.c_str());
  } else if (inferred_rows > 0 && inferred_cols > 0 \
      && inferred_rows * inferred_cols != static_cast<int>(total_elements)) {
    std::string message = "Size(" + std::to_string(total_elements) \
                           + ") must match the product of shape " \
                           + std::to_string(inferred_rows) + "," \
                           + std::to_string(inferred_cols);
    report_error(message.c_str());
  }

  if (inferred_rows == -1) {
    // Infer rows from cols
    if (new_cols == -2) {
      // flatten to 1D
      became_1d = true;
      inferred_rows = 1;
      inferred_cols = static_cast<int>(total_elements);
    } else if (total_elements % inferred_cols != 0) {
      std::string message = "The implicit shape can't be a fractional number. Got " \
                             + std::to_string(total_elements) \
                             + " / " + std::to_string(inferred_cols);
      report_error(message.c_str());
    } else {
      inferred_rows = total_elements / inferred_cols;
    }
  } else if (inferred_cols == -1) {
    // Infer cols from rows
    if (total_elements % inferred_rows != 0) {
      std::string message = "The implicit shape can't be a fractional number. Got " \
                             + std::to_string(total_elements) \
                             + " / " + std::to_string(inferred_rows);
      report_error(message.c_str());
    }
    inferred_cols = total_elements / inferred_rows;
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
