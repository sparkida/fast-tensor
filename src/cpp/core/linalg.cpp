#include "../Tensor.h"

// QR decomposition
Tensor Tensor::qr(Tensor* Q) const {/*{{{*/
  Tensor R = deepcopy();
  auto& R_data = (*R.data);
  auto& Q_data = *Q->data;

  for (size_t k = 0; k < cols; ++k) {
    // Compute the Householder vector
    std::vector<Real> x(rows - k, 0.0);
    for (size_t i = k; i < rows; ++i) {
      x[i - k] = R_data[i * cols + k];
    }

    Real norm_x = 0.0;
    for (Real val : x) {
      norm_x += val * val;
    }
    norm_x = std::sqrt(norm_x);
    if (x[0] > 0) {
      norm_x = -norm_x;
    }

    x[0] -= norm_x;
    Real norm_v = 0.0;
    for (Real val : x) {
      norm_v += val * val;
    }
    norm_v = std::sqrt(norm_v);

    if (norm_v < 1e-10) {
      continue; // Skip if norm is too small
    }

    for (Real& val : x) {
      val /= norm_v;
    }

    // Apply Householder transformation to R
    for (size_t j = k; j < cols; ++j) {
      Real dot_product = 0.0;
      for (size_t i = 0; i < x.size(); ++i) {
        dot_product += x[i] * R_data[(k + i) * cols + j];
      }
      for (size_t i = 0; i < x.size(); ++i) {
        R_data[(k + i) * cols + j] -= 2 * x[i] * dot_product;
      }
    }

    // Apply Householder transformation to Q
    for (size_t i = 0; i < rows; ++i) {
      Real dot_product = 0.0;
      for (size_t j = 0; j < x.size(); ++j) {
        dot_product += x[j] * Q_data[i * rows + (k + j)];
      }
      for (size_t j = 0; j < x.size(); ++j) {
        Q_data[i * rows + (k + j)] -= 2 * x[j] * dot_product;
      }
    }
  }
  return R;
}/*}}}*/


extern "C" {
  Tensor* tensor_qr(Tensor* tensor, Tensor* Q) { return new Tensor(tensor->qr(Q)); }
}
