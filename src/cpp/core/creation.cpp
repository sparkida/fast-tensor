#include "../Tensor.h"


// create identity matrix
Tensor Tensor::eye() const {/*{{{*/
  std::vector<Real> eye(rows * cols, 0.0f);
  for (size_t j = 0; j < cols; ++j) {
    eye[j * cols + j] = 1.0f;
  }
  return Tensor(rows, cols, is1d, std::move(eye));
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

extern "C" {
  Tensor* tensor_clone(Tensor* tensor) {
    return new Tensor(tensor->rows, tensor->cols, tensor->is1d, tensor->data);
  }

  Tensor* tensor_eye(Tensor* tensor) {
    return new Tensor(tensor->eye());
  }

  Tensor* tensor_diag(Tensor* tensor, int* shape_wire = nullptr) {
    Tensor* new_tensor = new Tensor(tensor->diag());
    update_shape_wire(new_tensor, shape_wire);
    return new_tensor;
  }
}
